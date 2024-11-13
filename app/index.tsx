import React, { useState } from "react";
import {
	View,
	Image,
	Text,
	TextInput,
	StyleSheet,
	TouchableOpacity,
	Alert,
	ScrollView, // Import ScrollView
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const API_URL = "http://192.168.123.218:5000";

interface ClothingDetails {
	description: string;
	tags: string[];
}

const UploadScreen = () => {
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [clothingDetails, setClothingDetails] =
		useState<ClothingDetails | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [editDescription, setEditDescription] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const pickImage = async () => {
		try {
			const permissionResult =
				await ImagePicker.requestMediaLibraryPermissionsAsync();

			if (!permissionResult.granted) {
				Alert.alert(
					"Permission Required",
					"Please grant camera roll permissions to continue"
				);
				return;
			}

			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsEditing: true,
				quality: 1,
			});

			if (!result.canceled && result.assets && result.assets[0].uri) {
				setSelectedImage(result.assets[0].uri);
				setClothingDetails(null);
			}
		} catch (error) {
			Alert.alert("Error", "Failed to pick image");
			console.error(error);
		}
	};

	const saveItemToDatabase = async () => {
		if (!selectedImage || !clothingDetails) {
			Alert.alert("Error", "Please upload and analyze an image first.");
			return;
		}

		try {
			const response = await axios.post(`${API_URL}/save_item`, {
				imageUri: selectedImage,
				description: clothingDetails.description,
				tags: clothingDetails.tags,
			});
			Alert.alert("Success", "Item saved successfully!");
			setSelectedImage(null);
			setClothingDetails(null);
			setIsEditing(false);
			setEditDescription(null);
		} catch (error) {
			console.error("Save error:", error);
			Alert.alert("Error", "Failed to save item. Please try again.");
		}
	};

	const uploadImage = async () => {
		if (!selectedImage) {
			Alert.alert("Error", "Please select an image first");
			return;
		}

		setIsLoading(true);

		try {
			const formData = new FormData();
			formData.append("image", {
				uri: selectedImage,
				type: "image/jpeg",
				name: "image.jpg",
			} as any);

			console.log("Attempting to upload to:", `${API_URL}/upload`);

			const response = await axios.post<ClothingDetails>(
				`${API_URL}/upload`,
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
						Accept: "application/json",
					},
					timeout: 50000,
				}
			);

			console.log("Upload response:", response.data);

			const processedData: ClothingDetails = {
				description: response.data.description || "No description available",
				tags: Array.isArray(response.data.tags) ? response.data.tags : [],
			};

			setClothingDetails(processedData);
			setEditDescription(processedData.description);
		} catch (error: any) {
			console.error("Upload error details:", {
				message: error.message,
				response: error.response?.data,
				status: error.response?.status,
			});

			Alert.alert(
				"Upload Failed",
				error.response?.data?.error ||
					error.message ||
					"Failed to analyze image. Please try again."
			);
		} finally {
			setIsLoading(false);
		}
	};

	const renderTags = () => {
		if (!clothingDetails?.tags?.length) {
			return <Text style={styles.noTags}>No tags available</Text>;
		}

		return (
			<View style={styles.tagsContainer}>
				{clothingDetails.tags.map((tag, index) => (
					<View key={index} style={styles.tagPill}>
						<Text style={styles.tagText}>{tag}</Text>
					</View>
				))}
			</View>
		);
	};

	const handleEditSave = () => {
		if (isEditing && editDescription !== null) {
			// Save the updated description
			setClothingDetails((prev) =>
				prev ? { ...prev, description: editDescription } : prev
			);
		}
		setIsEditing(!isEditing); // Toggle edit mode
	};

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView contentContainerStyle={styles.scrollContent}>
				<View style={styles.content}>
					<TouchableOpacity
						style={styles.button}
						onPress={pickImage}
						disabled={isLoading}
					>
						<Text style={styles.buttonText}>Pick an Image</Text>
					</TouchableOpacity>

					{selectedImage && (
						<Image
							source={{ uri: selectedImage }}
							style={styles.imagePreview}
						/>
					)}

					<TouchableOpacity
						style={[styles.button, isLoading && styles.disabledButton]}
						onPress={uploadImage}
						disabled={isLoading || !selectedImage}
					>
						<Text style={styles.buttonText}>
							{isLoading ? "Analyzing..." : "Upload Image"}
						</Text>
					</TouchableOpacity>

					{clothingDetails && (
						<View style={styles.detailsContainer}>
							{isEditing ? (
								<TextInput
									style={styles.editInput}
									value={editDescription ?? ""}
									onChangeText={setEditDescription}
									multiline
								/>
							) : (
								<Text style={styles.description}>
									{clothingDetails.description || "No description available"}
								</Text>
							)}
							<TouchableOpacity
								style={styles.editButton}
								onPress={handleEditSave}
							>
								<MaterialIcons
									name={isEditing ? "save" : "edit"} // Show save or edit icon
									size={24}
									color="#fff"
								/>
							</TouchableOpacity>
							{renderTags()}
						</View>
					)}
					{clothingDetails && (
						<View>
							{/* Existing Details Display and Edit UI */}

							<TouchableOpacity
								style={styles.button}
								onPress={saveItemToDatabase}
							>
								<Text style={styles.buttonText}>Save to wardrobe</Text>
							</TouchableOpacity>
						</View>
					)}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f4f4f9",
	},
	scrollContent: {
		flexGrow: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 20,
	},
	content: {
		width: "100%",
		padding: 20,
		backgroundColor: "#fff",
		borderRadius: 10,
		shadowColor: "#000",
		shadowOpacity: 0.1,
		shadowRadius: 10,
		elevation: 5,
		alignItems: "center",
	},
	button: {
		backgroundColor: "#007bff",
		paddingVertical: 12,
		paddingHorizontal: 30,
		borderRadius: 30,
		marginVertical: 10,
		width: "80%",
		justifyContent: "center",
		alignItems: "center",
	},
	disabledButton: {
		backgroundColor: "#cccccc",
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
		textAlign: "center",
	},
	imagePreview: {
		width: 200,
		height: 200,
		borderRadius: 10,
		marginVertical: 20,
		resizeMode: "cover",
	},
	detailsContainer: {
		marginTop: 20,
		width: "100%",
		padding: 15,
		paddingTop: 25,
		backgroundColor: "#f9f9f9",
		borderRadius: 8,
	},
	description: {
		marginTop: 20,
		fontSize: 16,
		color: "#333",
		marginBottom: 15,
		textAlign: "center",
	},
	tagsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
		gap: 8,
	},
	tagPill: {
		backgroundColor: "#fff",
		borderRadius: 20,
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderWidth: 1,
		borderColor: "#ddd",
		margin: 4,
	},
	tagText: {
		fontSize: 14,
		color: "#333",
	},
	noTags: {
		textAlign: "center",
		color: "#666",
		fontStyle: "italic",
	},
	editInput: {
		borderWidth: 2,
		borderColor: "#999",
		borderRadius: 20,
		padding: 10,
		fontSize: 16,
		color: "#333",
		marginBottom: 15,
		textAlignVertical: "top",
	},
	editButton: {
		paddingVertical: 3.9,
		backgroundColor: "#28a745",
		marginTop: 1,
		marginBottom: 5,
		marginLeft: 180,
		justifyContent: "center",
		alignItems: "center",
		width: "30%",
		borderRadius: 17,
	},
});

export default UploadScreen;
