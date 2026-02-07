import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { AnimatedGlassCard } from './AnimatedGlassCard';
import { MealEntry } from '@/types/Meal';

interface WeeklyEnergyTrendProps {
    meals: MealEntry[];
}

export function WeeklyEnergyTrend({ meals }: WeeklyEnergyTrendProps) {
    // Calculate data for each energy band
    const lightPoints: number[] = [];
    const moderatePoints: number[] = [];
    const heavyPoints: number[] = [];

    ['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach((_, index) => {
        const targetDay = (index + 1) % 7;
        const dayMeals = meals.filter(m => new Date(m.createdAt).getDay() === targetDay);

        lightPoints.push(dayMeals.filter(m => ['very_light', 'light'].includes(m.energyBand)).length);
        moderatePoints.push(dayMeals.filter(m => m.energyBand === 'moderate').length);
        heavyPoints.push(dayMeals.filter(m => ['heavy', 'very_heavy'].includes(m.energyBand)).length);
    });

    // Find global max across all bands
    const maxCount = Math.max(
        ...lightPoints,
        ...moderatePoints,
        ...heavyPoints,
        1 // Minimum 1 to avoid division by zero
    );

    const width = 300; // approximate
    const segmentWidth = width / 6;
    const chartHeight = 60;

    // Helper to create path data
    const createPath = (points: number[]) => {
        let pathData = '';
        points.forEach((count, i) => {
            const x = i * segmentWidth;
            const y = chartHeight - (count / maxCount) * 50;
            pathData += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
        });
        return pathData;
    };

    return (
        <AnimatedGlassCard intensity={30} delay={500} style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', marginBottom: 12, color: '#555' }}>Weekly Energy Trend</Text>
            <View style={{ height: 100, justifyContent: 'center' }}>
                <Svg height={80} width="100%">
                    {/* Light meals line (Green) */}
                    <Path
                        d={createPath(lightPoints)}
                        stroke="#4CAF50"
                        strokeWidth={2.5}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity={0.9}
                    />
                    {/* Moderate meals line (Yellow) */}
                    <Path
                        d={createPath(moderatePoints)}
                        stroke="#FFC107"
                        strokeWidth={2.5}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity={0.9}
                    />
                    {/* Heavy meals line (Red) */}
                    <Path
                        d={createPath(heavyPoints)}
                        stroke="#FF5252"
                        strokeWidth={2.5}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity={0.9}
                    />

                    {/* Dots for Light */}
                    {lightPoints.map((count, i) => {
                        if (count === 0) return null;
                        const x = i * segmentWidth;
                        const y = chartHeight - (count / maxCount) * 50;
                        return (
                            <Circle
                                key={`light-${i}`}
                                cx={x}
                                cy={y}
                                r={3}
                                fill="#4CAF50"
                            />
                        );
                    })}
                    {/* Dots for Moderate */}
                    {moderatePoints.map((count, i) => {
                        if (count === 0) return null;
                        const x = i * segmentWidth;
                        const y = chartHeight - (count / maxCount) * 50;
                        return (
                            <Circle
                                key={`mod-${i}`}
                                cx={x}
                                cy={y}
                                r={3}
                                fill="#FFC107"
                            />
                        );
                    })}
                    {/* Dots for Heavy */}
                    {heavyPoints.map((count, i) => {
                        if (count === 0) return null;
                        const x = i * segmentWidth;
                        const y = chartHeight - (count / maxCount) * 50;
                        return (
                            <Circle
                                key={`heavy-${i}`}
                                cx={x}
                                cy={y}
                                r={3}
                                fill="#FF5252"
                            />
                        );
                    })}
                </Svg>
                {/* Day labels below */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((dayLabel, index) => {
                        const isToday = new Date().getDay() === (index + 1) % 7;
                        return (
                            <Text
                                key={index}
                                style={{
                                    fontSize: 11,
                                    color: isToday ? '#1565c0' : '#444',
                                    fontWeight: isToday ? 'bold' : '600',
                                    flex: 1,
                                    textAlign: 'center'
                                }}
                            >
                                {dayLabel}
                            </Text>
                        );
                    })}
                </View>
            </View>
            {/* Legend */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <View style={{ width: 12, height: 3, backgroundColor: '#4CAF50', borderRadius: 2 }} />
                    <Text style={{ fontSize: 10, color: '#666' }}>Light</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <View style={{ width: 12, height: 3, backgroundColor: '#FFC107', borderRadius: 2 }} />
                    <Text style={{ fontSize: 10, color: '#666' }}>Moderate</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <View style={{ width: 12, height: 3, backgroundColor: '#FF5252', borderRadius: 2 }} />
                    <Text style={{ fontSize: 10, color: '#666' }}>Heavy</Text>
                </View>
            </View>
        </AnimatedGlassCard>
    );
}
