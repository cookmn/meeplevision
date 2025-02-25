import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np
import json

# Load the saved model
model = load_model("board_game_classifier.h5")

# Load the class names from the saved file
with open("class_names.json", "r") as f:
    class_names = json.load(f)

# Load and preprocess the test image
img_path = "/Users/morgancook/Desktop/BoardGames/Catan/catan.jpg"  # Change this to the actual image path
img = image.load_img(img_path, target_size=(256, 256))  # Resize the image to 256x256
img_array = image.img_to_array(img) / 255.0  # Normalize the image (rescale pixel values)
img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension (model expects [batch_size, height, width, channels])

# Make a prediction
predictions = model.predict(img_array)
predicted_class = np.argmax(predictions, axis=1)  # Get the class index with the highest probability

# Print the predicted class name
print(f"Predicted class: {class_names[predicted_class[0]]}")
