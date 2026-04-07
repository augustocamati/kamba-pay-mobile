import React from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable, Platform } from 'react-native';
import Svg, { Defs, Mask, Rect as SvgRect } from 'react-native-svg';

export interface TourStep {
  name: string;
  title: string;
  text: string;
}

interface SpotlightTourProps {
  steps: TourStep[];
  currentStep: number;
  layouts: Record<string, { x: number; y: number; width: number; height: number }>;
  onNext: () => void;
  onPrev: () => void;
  onFinish: () => void;
  visible: boolean;
}

const { width, height } = Dimensions.get('window');

export default function SpotlightTour({ steps, currentStep, layouts, onNext, onPrev, onFinish, visible }: SpotlightTourProps) {
  if (!visible || steps.length === 0) return null;

  const step = steps[currentStep];
  const rect = layouts[step.name];

  const holeX = rect ? rect.x - 8 : width / 2;
  const holeY = rect ? rect.y - 8 : height / 2;
  const holeW = rect ? rect.width + 16 : 0;
  const holeH = rect ? rect.height + 16 : 0;

  let bubbleTop = 100;
  if (rect) {
    const isTopHole = holeY < height / 2;
    // Position bubble below or above the hole, ensuring it stays on screen
    bubbleTop = isTopHole 
      ? Math.min(holeY + holeH + 20, height - 200) 
      : Math.max(holeY - 200, 50);
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      onNext();
    } else {
      onFinish();
    }
  };

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 9999, elevation: 9999 }]}>
      {/* Background that catches press to go next */}
      <Pressable style={StyleSheet.absoluteFill} onPress={handleNext}>
        <Svg height="100%" width="100%">
          <Defs>
            <Mask id="mask">
              <SvgRect x="0" y="0" width="100%" height="100%" fill="white" />
              <SvgRect x={holeX} y={holeY} width={holeW} height={holeH} rx="16" ry="16" fill="black" />
            </Mask>
          </Defs>
          <SvgRect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.85)" mask="url(#mask)" />
        </Svg>
      </Pressable>

      {/* Bubble overlay - pointerEvents box-none so we can press the buttons */}
      <View style={[styles.bubbleContainer, { top: bubbleTop }]} pointerEvents="box-none">
        <View style={styles.bubbleContent}>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.text}>{step.text}</Text>
          
          <View style={styles.footer}>
            <Text style={styles.counter}>{currentStep + 1} de {steps.length}</Text>
            <View style={styles.actions}>
              {currentStep > 0 && (
                <Pressable onPress={onPrev} style={styles.prevBtn}>
                  <Text style={styles.prevText}>Voltar</Text>
                </Pressable>
              )}
              <Pressable onPress={handleNext} style={styles.nextBtn}>
                <Text style={styles.nextText}>{currentStep === steps.length - 1 ? 'Começar!' : 'Próximo'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bubbleContainer: {
    position: 'absolute',
    left: 24,
    right: 24,
    alignItems: 'center',
    zIndex: 10000,
  },
  bubbleContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 15,
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 22,
    color: '#1A1A2E',
    marginBottom: 8,
  },
  text: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  counter: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: '#9CA3AF',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  prevBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  prevText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: '#6B7280',
  },
  nextBtn: {
    backgroundColor: '#FF8C00',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  nextText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
});
