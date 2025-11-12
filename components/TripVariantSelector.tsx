import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { TripVariantWithRelations } from '@/lib/supabase';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

interface TripVariantSelectorProps {
  variants: TripVariantWithRelations[];
  selectedVariantId?: number;
  onSelectVariant: (variant: TripVariantWithRelations) => void;
  basePrice: number;
  baseCurrency: string;
}

export default function TripVariantSelector({
  variants,
  selectedVariantId,
  onSelectVariant,
  basePrice,
  baseCurrency
}: TripVariantSelectorProps) {
  const [showModal, setShowModal] = useState(false);

  if (!variants || variants.length === 0) {
    return null;
  }

  const selectedVariant = variants.find(v => v.id === selectedVariantId);

  const formatPrice = (price: number, currency: string) => {
    const symbol = currency === 'MXN' ? '$' : currency === 'EUR' ? '€' : '$';
    return `${symbol}${price.toLocaleString()}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getVariantDisplayName = (variant: TripVariantWithRelations) => {
    // Si tiene un nombre específico, úsalo
    if (variant.variant_name) {
      return variant.variant_name;
    }

    // Si tiene detalles específicos con fecha
    if (variant.specific_details?.date) {
      return formatDate(variant.specific_details.date);
    }

    return `Opción ${variant.id}`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => setShowModal(true)}
      >
        <View style={styles.buttonContent}>
          <View style={styles.buttonLeft}>
            <IconSymbol name="calendar.badge.clock" size={20} color="#111827" />
            <View style={styles.textContainer}>
              <Text style={styles.label}>Fecha de salida</Text>
              <Text style={styles.selectedText}>
                {selectedVariant
                  ? getVariantDisplayName(selectedVariant)
                  : `${variants.length} fechas disponibles`}
              </Text>
            </View>
          </View>
          <IconSymbol name="chevron.right" size={20} color="#9CA3AF" />
        </View>
        {selectedVariant && (
          <Text style={styles.priceText}>
            {formatPrice(selectedVariant.price_from, selectedVariant.currency.code)}
          </Text>
        )}
      </TouchableOpacity>

      {/* Modal de selección */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <Animated.View
            entering={SlideInDown.duration(300)}
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona una fecha</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <IconSymbol name="xmark.circle.fill" size={28} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.variantsList}>
              {variants.map((variant) => {
                const isSelected = selectedVariantId === variant.id;
                return (
                  <TouchableOpacity
                    key={variant.id}
                    style={[styles.variantItem, isSelected && styles.variantItemSelected]}
                    onPress={() => {
                      onSelectVariant(variant);
                      setShowModal(false);
                    }}
                  >
                    <View style={styles.variantLeft}>
                      <View style={styles.variantHeader}>
                        <IconSymbol
                          name="calendar"
                          size={18}
                          color={isSelected ? '#FFFFFF' : '#111827'}
                        />
                        <Text style={[
                          styles.variantName,
                          isSelected && styles.variantNameSelected
                        ]}>
                          {getVariantDisplayName(variant)}
                        </Text>
                      </View>

                      {variant.variant_type && (
                        <View style={[
                          styles.typeBadge,
                          isSelected && styles.typeBadgeSelected
                        ]}>
                          <Text style={[
                            styles.typeText,
                            isSelected && styles.typeTextSelected
                          ]}>
                            {variant.variant_type}
                          </Text>
                        </View>
                      )}

                      {variant.specific_details?.description && (
                        <Text style={[
                          styles.variantDescription,
                          isSelected && styles.variantDescriptionSelected
                        ]}>
                          {variant.specific_details.description}
                        </Text>
                      )}
                    </View>

                    <View style={styles.variantRight}>
                      <Text style={[
                        styles.variantPrice,
                        isSelected && styles.variantPriceSelected
                      ]}>
                        {formatPrice(variant.price_from, variant.currency.code)}
                      </Text>
                      {isSelected && (
                        <View style={styles.checkmark}>
                          <IconSymbol name="checkmark.circle.fill" size={24} color="#10B981" />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  selectorButton: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  selectedText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  variantsList: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  variantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  variantItemSelected: {
    backgroundColor: '#111827',
    borderColor: '#10B981',
  },
  variantLeft: {
    flex: 1,
    marginRight: 12,
  },
  variantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  variantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  variantNameSelected: {
    color: '#FFFFFF',
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
    marginBottom: 8,
  },
  typeBadgeSelected: {
    backgroundColor: '#374151',
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  typeTextSelected: {
    color: '#FFFFFF',
  },
  variantDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  variantDescriptionSelected: {
    color: '#D1D5DB',
  },
  variantRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  variantPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  variantPriceSelected: {
    color: '#FFFFFF',
  },
  checkmark: {
    marginTop: 4,
  },
});
