import { useLocation, useNavigate } from "react-router-dom";

const useNavigatePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const navigateToPage = (page) => {

        const pilePage = JSON.parse(localStorage.getItem('pilePage') ?? '[]')
        pilePage.push(location.pathname)
        if(pilePage.length > 50) {
            pilePage.shift()
        }
        localStorage.setItem('pilePage', JSON.stringify(pilePage))
        navigate(page, { state: { from: location.pathname } });
    };
    
    return navigateToPage;
};

export default useNavigatePage;