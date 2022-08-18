import mockAxios from 'jest-mock-axios';
mockAxios.create = jest.fn(() => mockAxios)
// mockAxios.post = jest.fn(() => new Promise<any>());

export default mockAxios;