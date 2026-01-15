import api from './api';

export const uploadImage = async (uri: string) => {
    const formData = new FormData();
    const filename = uri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename || '');
    const type = match ? `image/${match[1]}` : `image`;

    formData.append('image', {
        uri,
        name: filename,
        type,
    } as any);

    const response = await api.post('/upload/single', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};

export const uploadImages = async (uris: string[]) => {
    const formData = new FormData();

    uris.forEach((uri, index) => {
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : `image`;

        formData.append('images', {
            uri,
            name: filename,
            type,
        } as any);
    });

    const response = await api.post('/upload/multiple', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};
