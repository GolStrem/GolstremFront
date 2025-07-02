// BoardMenuPortal.jsx
import { createPortal } from "react-dom";

const BoardMenuPortal = ({ children }) => {
  return createPortal(children, document.body);
};

export default BoardMenuPortal;
