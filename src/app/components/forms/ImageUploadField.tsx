import { useLargeStorage } from "app/hooks";
import { miscMessages } from "app/locale/common";
import { largeStorage } from "app/Storage";
import { ImageHandle } from "app/utils/Schema";
import uuid from "app/utils/uuid";
import React, { useRef } from "react";
import { FormattedMessage } from "react-intl";
import { FieldProps } from ".";
import Button from "../Button";


function readFileAsDataURL(file: File) {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.addEventListener("load", function () {
			if (reader.result) {
				if (reader.result instanceof ArrayBuffer) {
					const chars = new Uint16Array(reader.result as ArrayBuffer);
					resolve(String.fromCharCode.apply(null, chars as any));
				} else {
					resolve(reader.result);
				}
			} else {
				reject("No result");
			}
		}, false);

		reader.readAsDataURL(file);
	});
}


export interface FileInfo {
	filename: string;
	data: string;
}


export default function ImageUploadField(props: FieldProps<ImageHandle>) {
	const [file] = useLargeStorage<FileInfo>(props.value?.key);
	const ref = useRef<HTMLInputElement>(null);
	const key: (string | undefined) = typeof props.value == "object" ? props.value?.key : props.value;

	async function handleFile(file: File) {
		if (key) {
			await largeStorage.remove(key);
		}

		const id = key ?? `image-${uuid()}`;
		const data = await readFileAsDataURL(file);
		await largeStorage.set(id, {
			filename: file.name,
			data: data,
		});

		if (props.onChange) {
			props.onChange({ key: id });
		}
	}

	return (
		<>
			<input type="file" className="display-none" ref={ref}
				accept=".png,.jpg,image/png,image/jpeg"
				onChange={(e) => handleFile(e.target.files![0]).catch(console.error)} />

			{file &&
				<p className="text-muted">
					<FormattedMessage
							defaultMessage="Image: {filename}"
							values={{ filename: file.filename }} />
				</p>}

			<Button onClick={() => ref.current?.click()}
				label={miscMessages.chooseAFile} />
		</>);
}
