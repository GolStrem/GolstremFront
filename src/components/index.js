// Composants généraux
export { default as ProtectedRoute } from './general/ProtectedRoute';

// Login
export { default as fieldsConfigLogin } from './login/fieldsConfigLogin';
export { default as LnForgotModal } from './login/LnForgotModal';
export { default as lnFormUtils } from './login/lnFormUtils';
export { default as LnInput } from './login/LnInput';
export { default as LnModal } from './login/LnModal';
export { default as LnPasswordField } from './login/LnPasswordField';
export { default as LnResetPasswordModal } from './login/LnResetPasswordModal';
export { default as LnSuccessModal } from './login/LnSuccessModal';
export { default as UseLnFormValidator } from './login/UseLnFormValidator';

// Task Manager
export { default as Banner } from './taskManager/Banner';     
export { default as DnDBoard } from './taskManager/DnDBoard';
export { default as DnDCard } from './taskManager/DnDCard';
export { default as WorkspaceMenu } from './taskManager/WorkspaceMenu';

// Task Manager/card
export { default as TaskViewerModal } from './taskManager/modal/card/TaskViewerModal'; 
export { default as TaskEditorModal } from './taskManager/modal/card/TaskEditorModal'; 
export { default as Modal } from './taskManager/modal/card/TaskEditorModal';

// Task Manager/board
export { default as BoardModal } from './taskManager/modal/board/BoardModal';
export { default as DeleteBoardModal} from './taskManager/modal/board/DeleteBoardModal';
export {default as EditBoardTitleModal} from './taskManager/modal/board/EditBoardTitleModal';

// Task Manager/workspace
export { default as CreateWorkspaceModal} from './taskManager/modal/workspace/createWorkspaceModal';
export { default as DeleteWorkspaceModal } from './taskManager/modal/workspace/DeleteWorkspaceModal';
export { default as ModifWorkspaceModal} from './taskManager/modal/workspace/ModifWorkspaceModal';

// Task Manager/hook
export { default as useBoardManager } from './taskManager/hook/useBoardManager';
export { default as useCardManager} from './taskManager/hook/useCardManager';
export { default as useDomDragAndDrop} from './taskManager/hook/useDomDragAndDrop';
export { default as useSocketWorkspace} from './taskManager/hook/useSocketWorkspace';

export { default as BoardCardAccess } from './taskManager/utils/BoardCardAccess';
export { default as BaseModal } from './taskManager/utils/BaseModal';

export { default as AddUserModal } from './taskManager/modal/user/AddUserModal';
export { default as UserRightsModal } from './taskManager/modal/user/UserRightsModal';



// Config

export {default as UserNewPseudo } from './config/UserNewPseudo';
export {default as UserNewAvatar } from './config/UserNewAvatar';
export {default as ColorPicker } from './config/ColorPicker';


//Dasboard

export {default as BannerModal } from './dashboard/modal/BannerModal';
