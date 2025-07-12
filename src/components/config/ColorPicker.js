import { useEffect, useState } from "react";

const ColorPicker = () => {
  const [color, setColor] = useState("#f7c948"); // couleur par défaut

  // Charger la couleur enregistrée au montage
  useEffect(() => {
    const savedColor = localStorage.getItem("jaune");
    if (savedColor) {
      setColor(savedColor);
      document.documentElement.style.setProperty("--jaune", savedColor);
    }
  }, []);

  // Mettre à jour la variable CSS + localStorage quand l'utilisateur change
  const handleChange = (e) => {
    const newColor = e.target.value;
    setColor(newColor);
    document.documentElement.style.setProperty("--jaune", newColor);
    localStorage.setItem("jaune", newColor);
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
