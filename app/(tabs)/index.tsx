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
				mediaTypes: ImagePicker.MediaType,
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
		backgroundColor: "#f8f9fa",
	},
	scrollContent: {
		flexGrow: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 24,
		paddingVertical: 16,
	},
	content: {
		width: "100%",
		padding: 24,
		backgroundColor: "#ffffff",
		borderRadius: 16,
		shadowColor: "#000000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 3,
		alignItems: "center",
	},
	button: {
		backgroundColor: "#4361ee",
		paddingVertical: 14,
		paddingHorizontal: 32,
		borderRadius: 30,
		marginVertical: 12,
		width: "85%",
		justifyContent: "center",
		alignItems: "center",
		shadowColor: "#4361ee",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 4,
	},
	disabledButton: {
		backgroundColor: "#e9ecef",
		shadowOpacity: 0,
	},
	buttonText: {
		color: "#ffffff",
		fontSize: 16,
		fontWeight: "600",
		textAlign: "center",
	},
	imagePreview: {
		width: 240,
		height: 240,
		borderRadius: 16,
		marginVertical: 24,
		resizeMode: "cover",
		borderWidth: 1,
		borderColor: "#e9ecef",
	},
	detailsContainer: {
		marginTop: 24,
		width: "100%",
		padding: 20,
		paddingTop: 28,
		backgroundColor: "#ffffff",
		borderRadius: 16,
		borderWidth: 1,
		borderColor: "#e9ecef",
		shadowColor: "#000000",
		shadowOffset: {
			width: 0,
			height: 1,
		},
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	description: {
		marginTop: 16,
		fontSize: 16,
		color: "#495057",
		marginBottom: 16,
		textAlign: "center",
		lineHeight: 24,
	},
	tagsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
		gap: 8,
		marginTop: 8,
	},
	tagPill: {
		backgroundColor: "#f8f9fa",
		borderRadius: 20,
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderWidth: 1,
		borderColor: "#e9ecef",
		margin: 4,
	},
	tagText: {
		fontSize: 14,
		color: "#495057",
		fontWeight: "500",
	},
	noTags: {
		textAlign: "center",
		color: "#6c757d",
		fontStyle: "italic",
		marginTop: 12,
	},
	editInput: {
		borderWidth: 2,
		borderColor: "#4361ee",
		borderRadius: 16,
		padding: 16,
		fontSize: 16,
		color: "#212529",
		marginBottom: 16,
		textAlignVertical: "top",
		backgroundColor: "#ffffff",
	},
	editButton: {
		paddingVertical: 8,
		backgroundColor: "#4361ee",
		marginTop: 4,
		marginBottom: 8,
		marginLeft: "auto",
		justifyContent: "center",
		alignItems: "center",
		width: "auto",
		paddingHorizontal: 16,
		borderRadius: 12,
		flexDirection: "row",
		shadowColor: "#4361ee",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.15,
		shadowRadius: 3,
		elevation: 2,
	},
});

export default UploadScreen;
