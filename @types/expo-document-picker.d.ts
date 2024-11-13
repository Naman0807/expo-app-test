declare module "expo-document-picker" {
	export function getDocumentAsync(options?: {
		type?: string | string[];
		copyToCacheDirectory?: boolean;
	}): Promise<{
		assets: {
			length: number; type: "success" | "cancel"; uri?: string; name?: string; mimeType?: string; size?: number; 
};
		type: "success" | "cancel";
		uri?: string;
		name?: string;
		mimeType?: string;
		size?: number;
	}>;

	export function getMultipleDocumentsAsync(options?: {
		type?: string | string[];
		copyToCacheDirectory?: boolean;
	}): Promise<
		{
			type: "success" | "cancel";
			uri?: string;
			name?: string;
			mimeType?: string;
			size?: number;
		}[]
	>;
}
