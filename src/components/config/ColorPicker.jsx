import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { ApiService, UserInfo } from "@service";
import { setUserData } from "@store";

const ColorPicker = () => {
  const [color, setColor] = useState("#f7c948");
  const dispatch = useDispatch();
  const debounceRef = useRef(null); // sert à annuler le timer précédent

useEffect(() => {
  const fetchColor = async () => {
    const savedColor = await UserInfo.get("color");
    if (savedColor) {
      setColor(savedColor);
      document.documentElement.style.setProperty("--jaune", savedColor);
    }
  };

  fetchColor(); // on appelle la fonction async
}, []);

  const handleChange = (e) => {
    const newColor = e.target.value;

    // Mise à jour immédiate de l'interface
    setColor(newColor);
    document.documentElement.style.setProperty("--jaune", newColor);

    // Annule le timer précédent s'il existe
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Démarre un nouveau timer
    debounceRef.current = setTimeout(async () => {
      await ApiService.updateUserInfo({ color: newColor });
      dispatch(setUserData({ color: newColor }));
    }, 200);
  };

  return (
    <div style={{ padding: "1rem" }}>
      <label>
        Choisir une couleur :
        <input
          type="color"
          value={color}
          onChange={handleChange}
          style={{ marginLeft: "0.5rem" }}
        />
      </label>
    </div>
  );
};

export default ColorPicker;
