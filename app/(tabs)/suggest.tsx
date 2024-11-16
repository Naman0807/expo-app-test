import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	Image,
	TouchableOpacity,
	Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";

const API_URL = "http://192.168.123.218:5000";

interface ClothingItem {
	_id: string;
	image_uri: string;
	description: string;
	tags: string[];
}

export default function Suggest() {
	const [outfitSuggestion, setOutfitSuggestion] = useState<ClothingItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);

	const generateOutfit = async () => {
		setLoading(true);
		try {
			// You'll need to implement this endpoint in your backend
			const response = await axios.get(`${API_URL}/suggest`);
			setOutfitSuggestion(response.data);
		} catch (error) {
			console.error("Error generating outfit:", error);
		} finally {
			setLoading(false);
		}
	};
	const saveOutfit = async () => {
		if (outfitSuggestion.length === 0) {
			Alert.alert("Error", "Please generate an outfit first");
			return;
		}

		setSaving(true);
		try {
			const response = await axios.post(`${API_URL}/save-outfit`, {
				items: outfitSuggestion,
				date: new Date().toISOString(),
			});
			Alert.alert("Success", "Outfit saved successfully!");
		} catch (error) {
			console.error("Error saving outfit:", error);
			Alert.alert("Error", "Failed to save outfit");
		} finally {
			setSaving(false);
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView contentContainerStyle={styles.scrollContent}>
				<Text style={styles.title}>Outfit Suggestions</Text>

				<TouchableOpacity
					style={styles.generateButton}
					onPress={generateOutfit}
					disabled={loading}
				>
					<Text style={styles.buttonText}>
						{loading ? "Generating..." : "Generate New Outfit"}
					</Text>
				</TouchableOpacity>

				{outfitSuggestion.length > 0 ? (
					<View style={styles.outfitContainer}>
						{outfitSuggestion.map((item, index) => (
							<View key={item._id} style={styles.itemCard}>
								<Image
									source={{ uri: item.image_uri }}
									style={styles.itemImage}
								/>
								<Text style={styles.itemDescription}>{item.description}</Text>
							</View>
						))}

						<TouchableOpacity
							style={[styles.saveButton, saving && styles.disabledButton]}
							onPress={saveOutfit}
							disabled={saving}
						>
							<Text style={styles.buttonText}>
								{saving ? "Saving..." : "Save Outfit"}
							</Text>
						</TouchableOpacity>
					</View>
				) : (
					<Text style={styles.emptyText}>
						Tap the button above to get outfit suggestions based on your
						wardrobe!
					</Text>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f8f9fa",
	},
	scrollContent: {
		padding: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#212529",
		textAlign: "center",
		marginVertical: 20,
	},
	generateButton: {
		backgroundColor: "#4361ee",
		padding: 16,
		borderRadius: 12,
		marginVertical: 20,
	},
	buttonText: {
		color: "#ffffff",
		textAlign: "center",
		fontSize: 16,
		fontWeight: "600",
	},
	outfitContainer: {
		gap: 16,
	},
	itemCard: {
		backgroundColor: "#ffffff",
		borderRadius: 12,
		padding: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	itemImage: {
		width: "100%",
		height: 200,
		borderRadius: 8,
		marginBottom: 12,
	},
	itemDescription: {
		fontSize: 16,
		color: "#495057",
		textAlign: "center",
	},
	emptyText: {
		textAlign: "center",
		color: "#6c757d",
		fontSize: 16,
		marginTop: 40,
		fontStyle: "italic",
	},
	saveButton: {
		backgroundColor: "#28a745",
		padding: 16,
		borderRadius: 12,
		marginTop: 20,
	},
	disabledButton: {
		backgroundColor: "#6c757d",
		opacity: 0.7,
	},
});
