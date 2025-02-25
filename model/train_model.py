import tensorflow as tf
from tensorflow.keras import layers, models
import pathlib
import json

# Set up dataset path
dataset_dir = pathlib.Path("/Users/morgancook/Desktop/BoardGames")

# Load the dataset
train_dataset = tf.keras.preprocessing.image_dataset_from_directory(
    dataset_dir,
    image_size=(256, 256),
    batch_size=32,
    validation_split=0.2,  # Use 20% of data for validation
    subset="training",
    seed=123
)

# Prepare the validation dataset
val_dataset = tf.keras.preprocessing.image_dataset_from_directory(
    dataset_dir,
    image_size=(256, 256),
    batch_size=32,
    validation_split=0.2,
    subset="validation",
    seed=123
)

# Define the model
model = models.Sequential([
    layers.Rescaling(1./255, input_shape=(256, 256, 3)),  # Normalize image data
    layers.Conv2D(16, 3, activation='relu'),
    layers.MaxPooling2D(),
    layers.Conv2D(32, 3, activation='relu'),
    layers.MaxPooling2D(),
    layers.Conv2D(64, 3, activation='relu'),
    layers.MaxPooling2D(),
    layers.Flatten(),
    layers.Dense(128, activation='relu'),
    layers.Dense(len(train_dataset.class_names), activation='softmax')  # Output layer (one per class)
])

# Compile the model
model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

# Train the model
model.fit(train_dataset, validation_data=val_dataset, epochs=5)

# Save the trained model
model.save("board_game_classifier.h5")

# Save class names to a file (directly from train_dataset)
with open("class_names.json", "w") as f:
    json.dump(train_dataset.class_names, f)

print("Model and class names saved successfully!")
