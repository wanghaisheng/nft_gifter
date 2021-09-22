import React, { useCallback, useState } from 'react';
import { Stack, Caption, DropZone, Thumbnail } from '@shopify/polaris';
import { NoteMinor } from '@shopify/polaris-icons';

export default function Dropzone(props) {
    const [file, setFile] = useState();

    const handleDropZoneDrop = useCallback(
        (_dropFiles, acceptedFiles, _rejectedFiles) => {
            setFile((file) => acceptedFiles[0]);
            props.setImage(acceptedFiles[0]);
        },
        [],
    );

    const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];

    const fileUpload = !file && <DropZone.FileUpload />;
    const uploadedFile = file && (
        <Stack>
            <Thumbnail
                size="large"
                alt={file.name}
                source={
                    validImageTypes.includes(file.type)
                        ? window.URL.createObjectURL(file)
                        : NoteMinor
                }
            />
            <div>
                {file.name} <Caption>{file.size} bytes</Caption>
            </div>
        </Stack>
    );

    return (
        <DropZone
            accept={validImageTypes} type="image"
            allowMultiple={false} onDrop={handleDropZoneDrop}>
            {uploadedFile}
            {fileUpload}
        </DropZone>
    );
}
