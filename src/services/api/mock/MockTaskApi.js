import { mockWait } from '../ApiParent';
const mockWorkspaces = [
  { id: '1', name: 'Mock Workspace 1' },
  { id: '2', name: 'Mock Workspace 2' },
];

const mockBoards = [
  { id: '1', workspaceId: '1', name: 'Mock Board 1' },
  { id: '2', workspaceId: '1', name: 'Mock Board 2' },
];

const mockCards = [
  { id: '1', boardId: '1', title: 'Mock Card 1', description: '' },
  { id: '2', boardId: '1', title: 'Mock Card 2', description: '' },
];

const MockTaskApi = {
  async getWorkspaces() {
    await mockWait();
    return { data: mockWorkspaces };
  },

  async getWorkspaceDetail(workspaceId) {
    await mockWait();
    const workspace = mockWorkspaces.find((w) => w.id === workspaceId);
    return { data: workspace };
  },

  async createWorkspace(data) {
    await mockWait();
    const newWs = { id: Date.now().toString(), ...data };
    mockWorkspaces.push(newWs);
    return { data: newWs };
  },

  async updateWorkspace(workspaceId, data) {
    await mockWait();
    const ws = mockWorkspaces.find((w) => w.id === workspaceId);
    Object.assign(ws, data);
    return { data: ws };
  },

  async deleteWorkspace(workspaceId) {
    await mockWait();
    const index = mockWorkspaces.findIndex((w) => w.id === workspaceId);
    if (index >= 0) mockWorkspaces.splice(index, 1);
    return { data: { id: workspaceId } };
  },

  async createTableau(data) {
    await mockWait();
    const newBoard = { id: Date.now().toString(), ...data };
    mockBoards.push(newBoard);
    return { data: newBoard };
  },

  async editTableau(tableauId, data) {
    await mockWait();
    const board = mockBoards.find((b) => b.id === tableauId);
    Object.assign(board, data);
    return { data: board };
  },

  async deleteTableau(tableauId) {
    await mockWait();
    const index = mockBoards.findIndex((b) => b.id === tableauId);
    if (index >= 0) mockBoards.splice(index, 1);
    return { data: { id: tableauId } };
  },

  async createCard(data) {
    await mockWait();
    const newCard = { id: Date.now().toString(), ...data };
    mockCards.push(newCard);
    return { data: newCard };
  },

  async editCard(cardId, data) {
    await mockWait();
    const card = mockCards.find((c) => c.id === cardId);
    Object.assign(card, data);
    return { data: card };
  },

  async deleteCard(cardId) {
    await mockWait();
    const index = mockCards.findIndex((c) => c.id === cardId);
    if (index >= 0) mockCards.splice(index, 1);
    return { data: { id: cardId } };
  },

  async readCard(cardId) {
    await mockWait();
    const card = mockCards.find((c) => c.id === cardId);
    return { data: card };
  },

  async moveCard(data) {
    await mockWait();
    return { data };
  },

  async moveTableau(data) {
    await mockWait();
    return { data };
  },
};

export default MockTaskApi;