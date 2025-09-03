import React, { useState, useEffect } from 'react';
import { Brain, Loader, CheckCircle, AlertTriangle, Leaf } from 'lucide-react';
import axios from 'axios';

interface AIAnalysisProps {
  analysisId: string | null;
  selectedImage: File | null;
}

interface AnalysisResult {
  diagnosis: string;
  advice: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
}

export const AIAnalysis: React.FC<AIAnalysisProps> = ({ analysisId, selectedImage }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (analysisId && selectedImage) {
      analyzeImage();
    }
  }, [analysisId, selectedImage]);

  const analyzeImage = async () => {
    if (!selectedImage || !analysisId) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('analysisId', analysisId);

      const response = await axios.post('/api/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'medium': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'high': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      default: return <Leaf className="w-5 h-5 text-gray-400" />;
    }
  };

  if (!analysisId) return null;

  return (
    <div className="bg-white bg-opacity-20 backdrop-blur-lg border border-white border-opacity-30 rounded-2xl p-6 shadow-xl">
      <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
        <Brain className="w-5 h-5" />
        AI Analysis Results
      </h3>

      {isAnalyzing && (
        <div className="text-center py-8">
          <Loader className="w-12 h-12 text-white mx-auto mb-4 animate-spin" />
          <p className="text-white">Analyzing your crop image...</p>
          <p className="text-gray-300 text-sm mt-2">This may take a few moments</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500 bg-opacity-20 border border-red-400 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-200">
            <AlertTriangle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              {getSeverityIcon(result.severity)}
              <h4 className="text-white font-semibold">Diagnosis</h4>
              <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(result.severity)}`}>
                {result.severity.toUpperCase()}
              </span>
            </div>
            <p className="text-gray-200">{result.diagnosis}</p>
          </div>

          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-4">
            <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
              <Leaf className="w-4 h-4" />
              Recommended Actions
            </h4>
            <p className="text-gray-200">{result.advice}</p>
          </div>

          <div className="bg-blue-500 bg-opacity-20 border border-blue-400 rounded-lg p-3">
            <p className="text-blue-200 text-sm">
              Confidence Level: {Math.round(result.confidence * 100)}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
};