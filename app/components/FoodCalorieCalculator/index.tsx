'use client';

import React, { useState, useRef } from 'react';
import { Camera, Upload, AlertCircle } from 'lucide-react';

interface DetectionResult {
  containsFood: boolean;
  confidence: number;
  detectedObjects: string[];
}

interface CalorieResult {
  calories: number;
  detectedFood: string;
  confidence?: number;
  detectedObjects?: string[];
}

const FoodCalorieCalculator: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<CalorieResult | null>(null);
  const [error, setError] = useState<string>('');
  const [detectionConfidence, setDetectionConfidence] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock food detection with confidence score
  const detectFood = async (imageData: File): Promise<DetectionResult> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const confidence = Math.random();
          const containsFood = confidence > 0.7;

          const possibleObjects = containsFood ?
            ['plate', 'food', 'utensils'] :
            ['desk', 'paper', 'person', 'wall'];

          const detectedObjects = possibleObjects
            .slice(0, Math.floor(Math.random() * 3) + 1);

          resolve({
            containsFood,
            confidence,
            detectedObjects
          });
        };
        img.src = reader.result as string; // Set the src correctly.
      };
      reader.readAsDataURL(imageData);
    });
  };

  // Simulated calorie estimation
  const estimateCalories = async (imageData: File): Promise<CalorieResult> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const calories = Math.floor(Math.random() * 800) + 200;
        const detectedFood = ['Rice', 'Vegetables', 'Chicken'][Math.floor(Math.random() * 3)];
        resolve({
          calories,
          detectedFood
        });
      }, 1000);
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError('');
      setResult(null);
      setDetectionConfidence(0);

      // Create preview and load image
      const reader = new FileReader();
      reader.onload = async (e) => {
        setImagePreview(e.target.result as string);

        // Detect if image contains food
        const detection = await detectFood(file);
        setDetectionConfidence(detection.confidence);

        if (!detection.containsFood) {
          setError(`No food detected in the image (Confidence: ${Math.round(detection.confidence * 100)}%).
            Detected objects: ${detection.detectedObjects.join(', ')}`);
          setIsAnalyzing(false);
          return;
        }

        // Only estimate calories if food is detected with high confidence
        if (detection.confidence > 0.7) {
          const calorieResult = await estimateCalories(file);
          setResult({
            ...calorieResult,
            confidence: detection.confidence,
            detectedObjects: detection.detectedObjects
          });
        } else {
          setError('Low confidence in food detection. Please upload a clearer photo of food.');
        }
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError('An error occurred while analyzing the image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Food Calorie Calculator</h1>
        <p className="text-gray-600">Upload a photo of your food to estimate calories</p>
      </div>

      <div className="space-y-4">
        {/* Upload Area */}
        <div 
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {imagePreview ? (
            <div className="relative h-48 w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={imagePreview} 
                alt="Food preview" 
                className="max-h-48 mx-auto rounded-lg"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="w-12 h-12 mx-auto text-gray-400" />
              <p>Click to upload or drag and drop</p>
              <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>

        {/* Camera Button */}
        <button
          className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera className="w-5 h-5" />
          Take Photo
        </button>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <div>
                <h3 className="text-red-800 font-medium">Detection Failed</h3>
                <p className="text-red-700">{error.trim()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {isAnalyzing && (
          <div className="text-center py-4">
            <div className="animate-pulse">Analyzing your food...</div>
          </div>
        )}

        {result && (
          <div className="bg-green-50 p-4 rounded-lg text-red-800">
            <h2 className="font-bold text-lg mb-2">Analysis Results</h2>
            <p>Detected Food: {result.detectedFood}</p>
            <p>Confidence: {result.confidence ? `${Math.round(result.confidence * 100)}%` : 'N/A'}</p>
            <p>Detected Objects: {result.detectedObjects?.join(', ') || 'None'}</p>
            <p>Estimated Calories: {result.calories} kcal</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodCalorieCalculator;