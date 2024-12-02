import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Camera, Image as ImageIcon, Trash2 } from 'lucide-react-native';
import { colors } from '../../constants/colors';

interface PhotoContextMenuProps {
  visible: boolean;
  onClose: () => void;
  onTakePhoto: () => void;
  onChoosePhoto: () => void;
  onRemovePhoto?: () => void;
  hasExistingPhoto: boolean;
  anchorPosition: { x: number; y: number };
}

export const PhotoContextMenu = ({
  visible,
  onClose,
  onTakePhoto,
  onChoosePhoto,
  onRemovePhoto,
  hasExistingPhoto,
  anchorPosition,
}: PhotoContextMenuProps) => {
  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View 
          style={[
            styles.menu,
            {
              top: anchorPosition.y + 80,
              left: anchorPosition.x,
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              onChoosePhoto();
              onClose();
            }}
          >
            <ImageIcon size={20} color={colors.text} />
            <Text style={styles.menuText}>Choose Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              onTakePhoto();
              onClose();
            }}
          >
            <Camera size={20} color={colors.text} />
            <Text style={styles.menuText}>Take Photo</Text>
          </TouchableOpacity>

          {hasExistingPhoto && onRemovePhoto && (
            <TouchableOpacity 
              style={[styles.menuItem, styles.removeItem]}
              onPress={() => {
                onRemovePhoto();
                onClose();
              }}
            >
              <Trash2 size={20} color={colors.error} />
              <Text style={[styles.menuText, styles.removeText]}>Remove Photo</Text>
            </TouchableOpacity>
          )}
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menu: {
    position: 'absolute',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 8,
    minWidth: 180,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    borderRadius: 8,
  },
  menuText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  removeItem: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 4,
    paddingTop: 12,
  },
  removeText: {
    color: colors.error,
  },
});