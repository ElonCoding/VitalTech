import os
os.environ['KERAS_BACKEND'] = 'tensorflow'
import numpy as np
import keras
from flask import Flask, request, jsonify
from PIL import Image
import io
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

IMAGE_SIZE = (150, 150)

BRAIN_TUMOR_CLASSES = ['glioma', 'meningioma', 'notumor', 'pituitary']
LUNG_CANCER_CLASSES = ['benign', 'malignant', 'normal']
SKIN_DISEASE_CLASSES = ['acne', 'eczema', 'melanoma', 'normal', 'psoriasis']
TUBERCULOSIS_CLASSES = ['normal', 'tuberculosis']

# Load image models gracefully
def load_model_safe(path, name):
    if not os.path.exists(path):
        print(f'Warning: {name} model not found at {path}')
        return None
    try:
        model = keras.models.load_model(path, compile=False)
        print(f'{name} model loaded successfully!')
        return model
    except Exception as e:
        print(f'Warning: Failed to load {name} model: {e}')
        return None

brain_model = load_model_safe('brain_tumor_model.h5', 'Brain tumor')
lung_model = load_model_safe('lung_cancer_model.h5', 'Lung cancer')
skin_model = load_model_safe('skin_disease_model.h5', 'Skin disease')
tb_model = load_model_safe('chest_tuberculosis_model.h5', 'Tuberculosis')

# Load heart model gracefully
heart_model = None
heart_scaler = None
heart_features = None

try:
    import pandas as pd
    from sklearn.preprocessing import StandardScaler
    import fitz

    heart_model_path = os.path.join(os.path.dirname(__file__), 'Blood_Reports', 'HeartDiseaseModel.h5')
    if not os.path.exists(heart_model_path):
        heart_model_path = 'Blood_Reports/HeartDiseaseModel.h5'

    if os.path.exists(heart_model_path):
        heart_model = keras.models.load_model(heart_model_path, compile=False)
        print('Heart disease model loaded successfully!')
    else:
        print('Warning: Heart disease model not found, /predict-blood will be unavailable')

    dataset_path = os.path.join(os.path.dirname(__file__), 'dataset', 'BloodReport_HeartDeseise', 'heart_cleveland_upload.csv')
    if not os.path.exists(dataset_path):
        dataset_path = 'dataset/BloodReport_HeartDeseise/heart_cleveland_upload.csv'

    if os.path.exists(dataset_path):
        heart_df = pd.read_csv(dataset_path).dropna()
        heart_scaler = StandardScaler()
        heart_features = heart_df.drop('condition', axis=1).columns.tolist()
        heart_scaler.fit(heart_df[heart_features])
        print('Heart disease scaler fitted successfully!')
    else:
        print('Warning: Heart dataset not found')

except Exception as e:
    print(f'Warning: Heart disease module failed to initialize: {e}')

feature_good_ranges = {
    'age': (0, 50),
    'chol': (0, 200),
    'trestbps': (90, 120),
    'thalach': (100, 200),
    'fbs': (0, 0),
    'exang': (0, 0),
    'oldpeak': (0, 1),
    'ca': (0, 0),
}

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        'status': 'VitalTech AI Service is running',
        'endpoints': ['/health', '/predict', '/predict-blood']
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    file = request.files['image']
    scan_type = request.form.get('scanType')
    body_part = request.form.get('bodyPart')

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        image_bytes = file.read()
        img = Image.open(io.BytesIO(image_bytes))
        img = img.convert('RGB')

        if scan_type and body_part:
            if scan_type.lower() == 'mri' and body_part.lower() == 'brain':
                target_size = (150, 150)
                model = brain_model
                classes = BRAIN_TUMOR_CLASSES
            elif scan_type.lower() == 'ct' and body_part.lower() == 'lung':
                target_size = (224, 224)
                model = lung_model
                classes = LUNG_CANCER_CLASSES
            elif scan_type.lower() == 'xray' and body_part.lower() == 'chest':
                target_size = (150, 150)
                model = tb_model
                classes = TUBERCULOSIS_CLASSES
            else:
                return jsonify({'error': 'Unsupported scan type or body part combination'}), 400
        else:
            target_size = (224, 224)
            model = skin_model
            classes = SKIN_DISEASE_CLASSES

        if model is None:
            return jsonify({'error': 'Model not available for this scan type'}), 503

        img = img.resize(target_size)
        img_array = np.array(img)
        img_array = img_array.astype('float32') / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        prediction = model.predict(img_array)
        predicted_class = classes[np.argmax(prediction[0])]
        confidence = float(np.max(prediction[0]))

        return jsonify({
            'status': 'success',
            'class': predicted_class,
            'confidence': confidence
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/predict-blood', methods=['POST'])
def predict_blood():
    if heart_model is None or heart_scaler is None or heart_features is None:
        return jsonify({'error': 'Heart disease model not available'}), 503

    if 'report' not in request.files:
        return jsonify({'error': 'No report file uploaded'}), 400

    file = request.files['report']
    if file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400

    try:
        import fitz
        pdf_bytes = file.read()
        pdf = fitz.open(stream=pdf_bytes, filetype="pdf")
        text = "\n".join([page.get_text() for page in pdf])
        pdf.close()

        input_data = []
        for feature in heart_features:
            found = False
            for line in text.split('\n'):
                if feature.lower() in line.lower():
                    numbers = [float(word) for word in line.split() if word.replace('.', '', 1).isdigit()]
                    if numbers:
                        input_data.append(numbers[0])
                        found = True
                        break
            if not found:
                input_data.append(0.0)

        if len(input_data) != len(heart_features):
            return jsonify({'error': 'Incomplete data extracted'}), 400

        healthy = True
        for k, v in zip(heart_features, input_data):
            if k in feature_good_ranges:
                low, high = feature_good_ranges[k]
                if not (low <= v <= high):
                    healthy = False
                    break
        if healthy:
            return jsonify({
                'status': 'success',
                'prediction': 'No Heart Disease',
                'confidence': 100.0,
                'features_used': {k: float(v) for k, v in zip(heart_features, input_data)}
            })

        input_scaled = heart_scaler.transform([input_data])
        prediction = heart_model.predict(input_scaled)[0][0]
        result = "Heart Disease Detected" if prediction > 0.5 else "No Heart Disease"
        confidence = prediction if prediction > 0.5 else 1 - prediction

        return jsonify({
            'status': 'success',
            'prediction': result,
            'confidence': float(round(confidence * 100, 2)),
            'features_used': {k: float(v) for k, v in zip(heart_features, input_data)}
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
