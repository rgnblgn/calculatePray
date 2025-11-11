import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';

interface MainScreenProps {
    startDate: Date;
    debtDate: Date;
}

export default function MainScreen({ startDate, debtDate }: MainScreenProps) {
    return (
        <ScrollView style={styles.container}>
            <ThemedView style={styles.content}>
                <ThemedText type="title" style={styles.title}>
                    Namaz Takip
                </ThemedText>

                <View style={styles.section}>
                    <Collapsible title="Güncel Kazalar">
                        <ThemedView style={styles.testContainer}>
                            <ThemedText>Test</ThemedText>
                        </ThemedView>
                    </Collapsible>
                </View>

                <View style={styles.section}>
                    <Collapsible title="Geçmiş Kazalar">
                        <ThemedView style={styles.testContainer}>
                            <ThemedText>Test</ThemedText>
                        </ThemedView>
                    </Collapsible>
                </View>
            </ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    title: {
        textAlign: 'center',
        marginBottom: 30,
        marginTop: 20,
    },
    section: {
        marginBottom: 15,
    },
    testContainer: {
        padding: 15,
        borderRadius: 8,
    },
});
