import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { ApiService, UserInfo } from "@service";
import { setUserData } from "@store";
import { useTranslation } from "react-i18next";

const ColorPicker = () => {
  // ✅ On charge les deux namespaces
  const { t } = useTranslation("general");
  const [color, setColor] = useState("#f7c948");
  const dispatch = useDispatch();
  const debounceRef = useRef(null);

  useEffect(() => {
    const fetchColor = async () => {
      const savedColor = await UserInfo.get("color");
      if (savedColor) {
        setColor(savedColor);
        document.documentElement.style.setProperty("--jaune", savedColor);
      }
    };
    fetchColor();
  }, []);

  const handleChange = (e) => {
    const newColor = e.target.value;
    setColor(newColor);
    document.documentElement.style.setProperty("--jaune", newColor);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      await ApiService.updateUserInfo({ color: newColor });
      dispatch(setUserData({ color: newColor }));
    }, 200);
  };

  return (
    <div style={{ padding: "1rem" }}>
      <label>
        {t("general.chooseColor")}
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
