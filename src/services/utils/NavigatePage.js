import { useLocation, useNavigate } from "react-router-dom";

const useNavigatePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const navigateToPage = (page) => {
        navigate(page, { state: { from: location.pathname } });
    };
    
    return navigateToPage;
};

export default useNavigatePage;