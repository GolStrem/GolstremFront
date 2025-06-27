import React from "react";
import "./TaskManager.css";
import { useSelector } from "react-redux";
import Masonry from "react-masonry-css";
import { Sidebar, BoardModal, Modal, Board, Banner } from "@components";
import { useBoards } from "@components";


const TaskManager = ({ workspaceId = "Default" }) => {
  const mode = useSelector((state) => state.theme.mode);
  const {
    boards, setDraggingCardInfo, handleDrop,
    onBoardDragStart, onBoardDrop,
    handleUpdateBoard, handleDeleteBoard,
    openModal, showModal, modalData,
    closeModal, handleCreateOrUpdateCard,
    handleDeleteCard, showBoardModal, setShowBoardModal,
    handleCreateBoard,
    columns, sidebarVisible, setSidebarVisible
  } = useBoards(workspaceId);

  return (
    <div className={`tm-layout ${mode}`}>
      <button
        className={`hamburger-btn ${mode}`}
        onClick={() => setSidebarVisible(!sidebarVisible)}
        style={{ left: sidebarVisible ? "300px" : "0" }}
      >
        ☰
      </button>

      {sidebarVisible && <Sidebar />}
      <div className="tm-main-content" style={{ marginLeft: sidebarVisible ? "300px" : "0" }}>
        <Banner workspaceId={workspaceId} />
        <button onClick={() => setShowBoardModal(true)} className="tm-Tabl">
          + Créer un tableau
        </button>

        <div className="tm-boards-wrapper">
          <Masonry
            breakpointCols={columns}
            className="tm-boards-masonry"
            columnClassName="tm-boards-masonry-column"
          >
            {boards.map((board, index) => (
              <Board
                key={board.id}
                board={board}
                index={index}
                handleDrop={handleDrop}
                setDraggingCardInfo={setDraggingCardInfo}
                openModal={openModal}
                handleUpdateBoard={handleUpdateBoard}
                handleDeleteBoard={handleDeleteBoard}
                onBoardDragStart={onBoardDragStart}
                onBoardDrop={onBoardDrop}
              />
            ))}
          </Masonry>
        </div>
      </div>

      {showModal && (
        <Modal
          modalData={modalData}
          closeModal={closeModal}
          handleCreateOrUpdateCard={handleCreateOrUpdateCard}
          handleDeleteCard={handleDeleteCard}
        />
      )}

      {showBoardModal && (
        <BoardModal
          closeModal={() => setShowBoardModal(false)}
          handleCreateBoard={handleCreateBoard}
        />
      )}
    </div>
  );
};

export default TaskManager;
