import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

interface UseImagePickerReturn {
  imageUri: string | null;
  takePhoto: () => Promise<string | null>;
  pickFromGallery: () => Promise<string | null>;
  reset: () => void;
  getFormData: () => FormData | null;
}

export function useImagePicker(): UseImagePickerReturn {
  const [imageUri, setImageUri] = useState<string | null>(null);

  const takePhoto = useCallback(async (): Promise<string | null> => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      throw new Error('Camera permission denied');
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return null;

    const uri = result.assets[0].uri;
    setImageUri(uri);
    return uri;
  }, []);

  const pickFromGallery = useCallback(async (): Promise<string | null> => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      throw new Error('Photo library permission denied');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return null;

    const uri = result.assets[0].uri;
    setImageUri(uri);
    return uri;
  }, []);

  const reset = useCallback(() => {
    setImageUri(null);
  }, []);

  const getFormData = useCallback((): FormData | null => {
    if (!imageUri) return null;

    const formData = new FormData();
    const ext = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

    formData.append('receipt', {
      uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
      name: `receipt.${ext}`,
      type: mimeType,
    } as any);

    return formData;
  }, [imageUri]);

  return {
    imageUri,
    takePhoto,
    pickFromGallery,
    reset,
    getFormData,
  };
}
