import { useState, useCallback } from 'react';

const MAKE_DEFAULTS: Record<string, Pick<VehicleAnalysisResult, 'lifestyle' | 'tags'>> = {
  'Land Rover':     { lifestyle: 'Luxury',         tags: ['Premium', 'Off-Road', 'Prestige', 'Adventure', 'Comfort'] },
  'BMW':            { lifestyle: 'Performance',     tags: ['Sport', 'Executive', 'Precision', 'Urban', 'High-Output'] },
  'Porsche':        { lifestyle: 'Performance',     tags: ['Track Day', 'Sport', 'Aerodynamic', 'Precision', 'Low-Profile'] },
  'Audi':           { lifestyle: 'Luxury',          tags: ['Premium', 'Sport', 'Executive', 'Tech', 'Quattro'] },
  'Mercedes-Benz':  { lifestyle: 'Luxury',          tags: ['Premium', 'Executive', 'Comfort', 'Prestige', 'Tech'] },
  'Jaguar':         { lifestyle: 'Luxury',          tags: ['British', 'Executive', 'Sport', 'Prestige', 'Performance'] },
  'Ford':           { lifestyle: 'Adventure',       tags: ['Rugged', 'American', 'Versatile', 'Tow Ready', 'Trail Ready'] },
  'Jeep':           { lifestyle: 'Off-Road',        tags: ['4x4', 'Trail Ready', 'Adventure', 'Rugged', 'Mud Terrain'] },
  'Tesla':          { lifestyle: 'Urban Commuter',  tags: ['Electric', 'Tech', 'Sustainable', 'Sport', 'Innovation'] },
  'Chevrolet':      { lifestyle: 'Performance',     tags: ['American Muscle', 'V8', 'Sport', 'Iconic', 'Power'] },
};

const FALLBACK_DEFAULTS: Pick<VehicleAnalysisResult, 'lifestyle' | 'tags'> = {
  lifestyle: 'Lifestyle',
  tags: ['Automotive', 'Campaign', 'Vehicle'],
};

export interface VehicleField {
  value: string;
  confidence: number;
}

export interface VehicleAnalysisResult {
  lifestyle: string;
  tags: string[];
  confidence: number;
  vehicle: {
    year:  VehicleField;
    make:  VehicleField;
    model: VehicleField;
    trim:  VehicleField;
  };
}

export interface UseVehicleAnalysisReturn {
  result: VehicleAnalysisResult | null;
  analyzing: boolean;
  error: string | null;
  analyze: (file: File) => Promise<void>;
}

export async function analyzeVehicle(file: File): Promise<VehicleAnalysisResult> {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch('/api/detect-make', { method: 'POST', body: form });
  if (!res.ok) throw new Error(`detect-make failed: ${res.status}`);

  const { make, confidence } = await res.json() as { make: string | null; confidence: number };
  const defaults = (make ? (MAKE_DEFAULTS[make] ?? FALLBACK_DEFAULTS) : FALLBACK_DEFAULTS);

  return {
    lifestyle: defaults.lifestyle,
    tags:      defaults.tags,
    confidence,
    vehicle: {
      year:  { value: '',        confidence: 0 },
      make:  { value: make ?? '', confidence },
      model: { value: '',        confidence: 0 },
      trim:  { value: '',        confidence: 0 },
    },
  };
}

export function useVehicleAnalysis(): UseVehicleAnalysisReturn {
  const [result,    setResult]    = useState<VehicleAnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const analyze = useCallback(async (file: File) => {
    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      setResult(await analyzeVehicle(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setAnalyzing(false);
    }
  }, []);

  return { result, analyzing, error, analyze };
}
