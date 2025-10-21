const API_BASE_URL = 'https://68da41f623ebc87faa2f7a7a.mockapi.io/Art/art';

export const fetchArtTools = async () => {
  try {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching art tools:', error);
    throw error;
  }
};

export const fetchArtToolById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching art tool by ID:', error);
    throw error;
  }
};

