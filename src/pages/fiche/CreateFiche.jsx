import React, { useState, useEffect } from "react";
import {
  FicheCardGeneral, 
  FicheCardCharacter, 
  FicheCardStory, 
  FicheCardPower, 
  FicheCardGallery,
  ModalGeneric,
  BackLocation
} from "@components";
import "./CreateFiche.css";
import { useParams } from "react-router-dom";
import { ApiFiche, ApiService } from "@service"

const CreateFiche = () => {
  const { id: ficheId } = useParams();

  const [characterData, setCharacterData] = useState({});
  const [index, setIndex] = useState({});
  const [img, setImg] = useState({});

  const [activeTab, setActiveTab] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [isModuleSelectorOpen, setModuleSelectorOpen] = useState(false);
  const [listModule, setListModule] = useState([])

  // callback pour ouvrir la modale dans l'angle droit
  const handleOpenModuleSelector = () => setModuleSelectorOpen(true);
  const handleSaveModuleSelector = async (modules) => {
    const newModules = modules.selectedModules;
    const oldModules = listModule;
    
    try {
      let firstValidModule = null;
      // Supprimer les modules qui ne sont plus sélectionnés

      if (newModules.length === 0) {
        newModules = ['general']
      }


      for (const oldModule of oldModules) {
        if (!newModules.includes(oldModule)) {
          const moduleToDelete = characterData.module.find(m => m.name === oldModule);
          
          if (moduleToDelete) {
            if (moduleToDelete.name === activeTab) {
              firstValidModule = Object.keys(componentMap).find((tabName) => 
                newModules.some((m) => m === tabName)
              );
            }
            await ApiService.deleteModule(moduleToDelete.id);
            
            setCharacterData(prev => ({
              ...prev,
              module: prev.module.filter(m => m.id !== moduleToDelete.id)
            }));
          }
        }
      }
      
      for (const newModule of newModules) {
        if (!oldModules.includes(newModule)) {
          const createdModule = await ApiService.createModule(1, ficheId, newModule);
          const transformed = Object.entries(createdModule.data).map(([id, obj]) => ({
            id: Number(id), 
            name: obj.name,
            extra: JSON.parse(obj.extra)
          }));
          
           setCharacterData(prev => ({
             ...prev,
             module: [...prev.module, transformed[0]]
           }));
        }
      }
      
      // Mettre à jour listModule avec les nouveaux modules
      setListModule(newModules);
      setModuleSelectorOpen(false);
      if(firstValidModule !== null) {
        setActiveTab(firstValidModule);
      }
      
    } catch (error) {
      console.error('Erreur lors de la gestion des modules:', error);
    }
  };

  // Ouvre la modale de sélection au premier accès à cette fiche (clé par ficheId)
  
  const openModuleSelectorIfFirstVisit = () => {
    try {
      const key = `cf_seen_fiche_${ficheId}`;
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, "1");
        setModuleSelectorOpen(true);
      }
    } catch (e) {
      // Silencieux si localStorage indisponible
    }
  };


  const componentMap = {
    general: {
      component : FicheCardGeneral,
      fields : {
        age: { type: "inputText", label: "Âge" },
        image: { type: "inputUrl", label: "Image (URL)" },
        about: { type: "textarea", label: "À propos" },
      }
    },
    character: {
      component : FicheCardCharacter,
      fields : {
        personalité: { type: "textarea", label: "Personalité" },
        peur: { type: "textarea", label: "Peur" },
        motivation: { type: "textarea", label: "Motivation" },
        image: { type: "inputUrl", label: "Image (URL)" },
        another: { type: "textarea", label: "Information complémentaire" }
      }
    },
    story: {
      component : FicheCardStory,
      fields : {
        story: { type: "chapter", label: "" },
        image: { type: "inputUrl", label: "Image (URL)" },
      }
    },
    power: {
      component : FicheCardPower,
      fields : {
        power: { type: "textTextArea+", label: "" },
        image: { type: "inputUrl", label: "Image (URL)" },
      }
    },
    gallery: {
      component : FicheCardGallery,
      fields : {
        imageGallery: { type: "texteImg+", label: "" },
        image: { type: "inputUrl", label: "Image (URL)" },
      }
    },
  };

  const fieldsModale =   {
    'modules': {
      type: "checkBox",
      list: ["general", "character", "story", "power", "gallery"],
      label: "",
      key: "selectedModules"
    }
  }


  useEffect(() => {
    const fetchFiche = async () => {
      try {
        const { data } = await ApiFiche.getFicheDetail(ficheId);
        if (data.module.length === 0) {
          const module = await ApiService.createModule(1, ficheId, "general")
          const transformed = Object.entries(module.data).map(([id, obj]) => ({
            id: Number(id), 
            name: obj.name,
            extra: obj.extra
          }));
          data.module.push(transformed[0])
        }


        const style = document.createElement("style");
        style.id = 'cf-right';
        style.textContent = `.cf-right { background: ${data.color}; }`
        document.head.appendChild(style);
        // Parse sécurisé des champs extra (JSON string -> objet)
        const safeParse = (val) => {
          if (val == null) return {};
          if (typeof val === 'object') return val;
          try {
            const parsed = JSON.parse(val);
            return parsed && typeof parsed === 'object' ? parsed : {};
          } catch (e) {
            return {};
          }
        };

        const parsedData = {
          ...data,
          module: Array.isArray(data.module)
            ? data.module.map((m) => ({ ...m, extra: safeParse(m.extra) }))
            : [],
        };

        // Trouver le premier module qui correspond à un composant existant
        const firstValidModule = Object.keys(componentMap).find((tabName) => 
          parsedData.module.some((m) => m.name === tabName)
        );
        const defaultTab = firstValidModule ?? "general";
        setActiveTab(defaultTab);
        setIndex(parsedData.module.findIndex(item => item.name === defaultTab))

        const listModule = parsedData.module.map((e) => e.name)
        setListModule(listModule)

        setImg(parsedData.image)
        setCharacterData(parsedData);
        setIsLoading(false);
        // Ouvrir la sélection des modules lors de la toute première visite
        openModuleSelectorIfFirstVisit();
      } catch (error) {
        console.error("erreur", error);
        setIsLoading(false);
      }
    };

    fetchFiche();
  }, []);


  useEffect(() => {
    if(characterData.module === undefined) {
      return;
    }

    const indexUse = characterData.module.findIndex(item => item.name === activeTab)
    setImg(characterData.module[indexUse].extra.image || characterData.image)
    setIndex(indexUse)
  }, [activeTab]);

  // Callback pour ouvrir la modale depuis le module
  const handleOpenModal = () => setIsModalOpen(true);

  const handleSave = (updated) => {
    const index = characterData.module.findIndex(item => item.name === activeTab);
    const moduleId = characterData.module[index].id
    if (updated.image !== undefined && updated.image !== '') {
      setImg(updated.image)
    }
    ApiService.updateModule(moduleId, {extra: updated})
    setCharacterData(prev => ({
      ...prev,
      module: prev.module.map((m, i) => 
        i === index ? { ...m, extra: updated } : m
      )
    }))
    setIsModalOpen(false);
  };

  // Ne pas rendre tant que les données ne sont pas chargées
  if (isLoading || !activeTab) {
    return <div className="cf-container">Chargement...</div>;
  }

  const ActiveComponent = componentMap[activeTab].component;
  const fields = componentMap[activeTab].fields

  return (
    <div className="cf-container">
      {/* Bouton de retour */}
      <BackLocation />

      <div className="cf-right" aria-hidden="true" />
      <div className="cf-left" aria-hidden="true">
        <img src={characterData.image} alt="Portrait décoratif" className="cf-img" />
      </div>

      <div className="cf-card">
        {/* Passer la data + callback pour la modale */}
        <ActiveComponent
          data={characterData}
          indexModule={index}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onEdit={handleOpenModal}
        />

        <aside className="cf-portrait-float">
          <img src={img} alt="Portrait du personnage" />
        </aside>
      </div>

      {/* Modal centralisée, visible uniquement pour "general" */}
      {isModalOpen && (
        <ModalGeneric
          onClose={() => setIsModalOpen(false)}
          handleSubmit={handleSave}
          initialData={characterData.module[index].extra}
          fields={fields}
          name={ficheId+"-"+activeTab}
          noClose={true}
          title={activeTab}
        />
      )}

      <div className="cf-global-badges">
        <span className="cf-badge">DISCORD</span>
        <span className="cf-badge">SERVEUR ZHENEOS</span>
      </div>


      {/* Bouton pour ouvrir la modale */}
      <button 
        className="cf-module-selector-btn"
        onClick={handleOpenModuleSelector}
      >
        Choisir modules
      </button>

             {isModuleSelectorOpen && (
         <ModalGeneric
           onClose={() => setModuleSelectorOpen(false)}
           handleSubmit={handleSaveModuleSelector}
           fields={fieldsModale}
           title={"Choisissez vos modules à afficher"}
           initialData={{ selectedModules: listModule }}
         />
       )}

    </div>
  );
};

export default CreateFiche;
