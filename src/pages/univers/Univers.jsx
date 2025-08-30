import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Univers.css";
import { ffimg } from "@assets";
import { ModalGeneric } from "@components";
import { FaPaintBrush, FaTrash, FaEyeSlash, FaEdit, FaListUl } from "react-icons/fa";
import { createUniversDeleteFields, createUniversCreateFields } from "@components/general/fieldModal/universFields";
import { ApiUnivers, ApiService } from "@service";

const CATEGORIES = [
  { key: "fiches",            label: "Fiches",               to: "/univers/fiches" },
  { key: "encyclopedie",      label: "Encyclopédie",         to: "/univers/encyclopedie" },
  { key: "etablissement",     label: "Établissement",        to: "/univers/etablissements" },
  { key: "ouverture",         label: "Ouverture / Inscription",to: "/univers/ouvertures" },
  { key: "tableau-affichage", label: "Tableau d'affichage",  to: "/univers/tableau" },
  { key: "Gallerie", label: "Gallerie",  to: "/univers/gallerie" }
];



const Univers = () => {
  const navigate = useNavigate();
  const { id: universId } = useParams(); // Récupérer l'ID de l'univers depuis l'URL
  const [isEditImagesOpen, setIsEditImagesOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditInfoOpen, setIsEditInfoOpen] = useState(false);
  const [isBackgroundDisabled, setIsBackgroundDisabled] = useState(false);
  const [isSelectCategoriesOpen, setIsSelectCategoriesOpen] = useState(false);
  const [isImagesLoading, setIsImagesLoading] = useState(false);
  const [isInfoLoading, setIsInfoLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [visibleCategories, setVisibleCategories] = useState(() => CATEGORIES.map(c => c.label));
  const [droits, setDroits] = useState("write");
  const [error, setError] = useState(null);
  const [universData, setUniversData] = useState({});
  const [listModule, setListModule] = useState([]);
  const [images, setImages] = useState({
    bgImage: "",
    fiches: "",
    encyclopedie: "",
    etablissement: "",
    ouverture: "",
    tableau: "",
    gallerie: "",
  });



  const [universInfo, setUniversInfo] = useState({
    NomUnivers: "",
    descriptionUnivers: "",
    image: "",
    tagsUnivers: [],
    selectVisibily: "Public",
    flagsCreate: []
  });

  // Mapping des modules disponibles pour les univers
  const availableModules = ["fiche", "encyclopedie", "etablissement", "inscription", "questLog", "gallery", "misc"];

  // Fonction pour traiter les modules et extraire les images
  const processModules = useCallback((modules) => {
    const processedImages = {};
    
    console.log("processModules appelé avec:", modules);
    
    modules.forEach(module => {
      try {
        // Gérer le cas où extra est déjà un objet ou une string
        let extra;
        if (typeof module.extra === 'string') {
          extra = JSON.parse(module.extra || '{}');
        } else if (typeof module.extra === 'object') {
          extra = module.extra || {};
        } else {
          extra = {};
        }
        
        console.log(`Module ${module.name} - Extra traité:`, extra);
        
        // Mapping des noms de modules vers les clés d'images
        const moduleKey = module.name === 'fiche' ? 'fiches' : 
                         module.name === 'gallery' ? 'gallerie' : 
                         module.name === 'inscription' ? 'ouverture' : 
                         module.name === 'questLog' ? 'tableau' : 
                         module.name;
        
        if (extra.image) {
          processedImages[moduleKey] = extra.image;
          console.log(`Image trouvée pour ${moduleKey}:`, extra.image);
        } else {
          console.log(`Aucune image trouvée pour ${moduleKey}`);
        }
      } catch (e) {
        console.error(`Erreur lors du parsing du module ${module.name}:`, e);
        console.error(`Valeur extra:`, module.extra);
      }
    });
    
    console.log("Images traitées:", processedImages);
    return processedImages;
  }, []);

  // Fonction pour mettre à jour les catégories visibles
  const updateVisibleCategories = useCallback((modules) => {
    const availableCategories = CATEGORIES.filter(cat => {
      const moduleName = cat.key === 'tableau-affichage' ? 'questLog' : 
                       cat.key === 'Gallerie' ? 'gallery' : 
                       cat.key === 'ouverture' ? 'inscription' : 
                       cat.key === 'fiches' ? 'fiche' : 
                       cat.key;
      return modules.includes(moduleName);
    }).map(cat => cat.label);
    
    setVisibleCategories(availableCategories);
  }, []);

  // Fonction pour gérer la sélection des modules
  const handleSaveModuleSelector = useCallback(async (modules) => {
    let newModules = Array.isArray(modules?.selectedModules) ? [...modules.selectedModules] : [];
    const oldModules = Array.isArray(listModule) ? [...listModule] : [];

    // Ne garder que les modules supportés et dédoublonner
    newModules = [...new Set(newModules.filter((m) => availableModules.includes(m)))];

    // Si rien sélectionné, on force "misc"
    if (newModules.length === 0) {
      newModules = ["misc"];
    }

    try {
      // Supprimer les modules non sélectionnés
      for (const oldModule of oldModules) {
        if (!newModules.includes(oldModule)) {
          const moduleToDelete = universData.module?.find((m) => m.name === oldModule);
          if (moduleToDelete) {
            await ApiService.deleteModule(moduleToDelete.id);
            setUniversData((prev) => ({
              ...prev,
              module: prev.module.filter((m) => m.id !== moduleToDelete.id),
            }));
          }
        }
      }

      // Créer les nouveaux modules manquants
      for (const mod of newModules) {
        if (!oldModules.includes(mod)) {
          const createdModule = await ApiService.createModule(2, universId, mod);
          const transformed = Object.entries(createdModule.data).map(([id, obj]) => ({
            id: Number(id),
            name: obj.name,
            extra: JSON.parse(obj.extra),
          }));

          setUniversData((prev) => ({
            ...prev,
            module: [...prev.module, transformed[0]],
          }));
        }
      }

      // Mettre à jour la liste + fermer la modale
      setListModule(newModules);
      setIsSelectCategoriesOpen(false);

      // Mettre à jour les catégories visibles
      updateVisibleCategories(newModules);
    } catch (error) {
      console.error("Erreur lors de la gestion des modules:", error);
    }
  }, [listModule, universData.module, universId, updateVisibleCategories]);

  // Récupération des données de l'univers depuis l'API
  useEffect(() => {
    const fetchUniversData = async () => {
      if (!universId) {
        return;
      }

      try {
        
        setError(null);
        
        const response = await ApiUnivers.getDetailUnivers(universId);
        const data = response.data;
        
        // Parse sécurisé des champs extra
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

        // Mise à jour des informations de l'univers
        setUniversInfo({
          NomUnivers: data.name || "Univers",
          descriptionUnivers: data.description || "",
          image: data.image || "",
          tagsUnivers: [],
          selectVisibily: "Public",
          flagsCreate: []
        });
        
        // Mise à jour des droits
        setDroits(data.droit || "read");
        
        // Traitement des modules pour extraire les images
        if (parsedData.module && Array.isArray(parsedData.module)) {
          console.log("Modules trouvés:", parsedData.module);
          console.log("Background de l'univers:", data.background);
          
          const processedImages = processModules(parsedData.module);
          console.log("Images traitées dans useEffect:", processedImages);
          
          setImages(prev => {
            const newImages = {
              ...prev,
              bgImage: data.background || prev.bgImage,
              ...processedImages
            };
            console.log("Nouvel état des images:", newImages);
            return newImages;
          });

          // Mettre à jour la liste des modules
          const moduleList = parsedData.module.map((m) => m.name);
          setListModule(moduleList);
          
          // Mettre à jour les catégories visibles
          updateVisibleCategories(moduleList);
        }
        
        setUniversData(parsedData);
        
      } catch (err) {
        console.error("Erreur lors de la récupération des données de l'univers:", err);
        setError("Erreur lors du chargement de l'univers");
      }
    };

    fetchUniversData();
  }, [universId, processModules, updateVisibleCategories]);

  const fields = useMemo(() => ({
    bgImage: { type: "inputUrl", label: "Image d'arrière-plan" },
    fiches: { type: "inputUrl", label: "Fiches" },
    encyclopedie: { type: "inputUrl", label: "Encyclopédie" },
    etablissement: { type: "inputUrl", label: "Établissement" },
    ouverture: { type: "inputUrl", label: " Ouverture / Inscription" },
    tableau: { type: "inputUrl", label: "Tableau d'affichage" },
    gallerie: { type: "inputUrl", label: "Gallerie" },
  }), []);

  const deleteFields = useMemo(() => createUniversDeleteFields(), []);
  const infoFields = useMemo(() => createUniversCreateFields([]), []);

  const categoriesFields = useMemo(() => ({
    selectedModules: {
      type: "checkBox",
      list: availableModules,
      label: "Modules à afficher :",
      key: "selectedModules",
    }
  }), []);

  // Fonctions de soumission des modales
  const handleSubmitImages = async (values) => {
    setIsImagesLoading(true);
    try {
      console.log("Début de la sauvegarde des images:", values);
      
      // Mise à jour de l'image de l'univers (background)
      if (values.bgImage !== images.bgImage) {
        console.log("Mise à jour du background:", values.bgImage);
        await ApiUnivers.editUnivers(universId, {
          background: values.bgImage || null
        });
      }

      // Mise à jour des images des modules
      const moduleUpdates = [];
      
      // Mapping des clés d'images vers les noms de modules
      const imageToModuleMapping = {
        fiches: 'fiche',
        encyclopedie: 'encyclopedie',
        etablissement: 'etablissement',
        ouverture: 'inscription',
        tableau: 'questLog',
        gallerie: 'gallery'
      };

      for (const [imageKey, imageUrl] of Object.entries(values)) {
        if (imageKey === 'bgImage') continue; // Déjà traité ci-dessus
        
        const moduleName = imageToModuleMapping[imageKey];
        if (moduleName && imageUrl !== images[imageKey]) {
          console.log(`Mise à jour du module ${moduleName} avec l'image:`, imageUrl);
          
          const moduleToUpdate = universData.module?.find(m => m.name === moduleName);
          if (moduleToUpdate) {
            const currentExtra = moduleToUpdate.extra || {};
            const newExtra = { ...currentExtra, image: imageUrl || "" };
            
            console.log(`Module ${moduleName} - Extra actuel:`, currentExtra);
            console.log(`Module ${moduleName} - Nouveau extra:`, newExtra);
            
            moduleUpdates.push(
              ApiService.updateModule(moduleToUpdate.id, {
                extra: JSON.stringify(newExtra)
              })
            );
          } else {
            console.warn(`Module ${moduleName} non trouvé dans universData.module`);
          }
        }
      }

      // Exécuter toutes les mises à jour de modules en parallèle
      if (moduleUpdates.length > 0) {
        console.log("Exécution des mises à jour de modules:", moduleUpdates.length);
        await Promise.all(moduleUpdates);
        console.log("Toutes les mises à jour de modules sont terminées");
      }

      // Mettre à jour l'état local
      setImages(prev => ({ ...prev, ...values }));
      
      // Recharger les données de l'univers pour s'assurer de la synchronisation
      console.log("Rechargement des données de l'univers...");
      const response = await ApiUnivers.getDetailUnivers(universId);
      const data = response.data;
      
      // Mettre à jour les données de l'univers
      setUniversData(prev => ({
        ...prev,
        background: data.background,
        module: Array.isArray(data.module)
          ? data.module.map((m) => ({ 
              ...m, 
              extra: typeof m.extra === 'string' ? JSON.parse(m.extra || '{}') : m.extra 
            }))
          : []
      }));

      // Mettre à jour les images avec les nouvelles données
      if (data.module && Array.isArray(data.module)) {
        const processedImages = processModules(data.module);
        setImages(prev => ({
          ...prev,
          bgImage: data.background || prev.bgImage,
          ...processedImages
        }));
      }

      console.log("Sauvegarde terminée avec succès");
      setIsEditImagesOpen(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour des images:", error);
      alert("Erreur lors de la sauvegarde des images. Veuillez réessayer.");
    } finally {
      setIsImagesLoading(false);
    }
  };

  const handleSubmitInfo = async (values) => {
    setIsInfoLoading(true);
    try {
      console.log("Début de la sauvegarde des informations:", values);
      
      // Préparer le payload pour l'API
      const payload = {
        name: values.NomUnivers,
        description: values.descriptionUnivers,
        image: values.image || null
      };
      
      console.log("Payload pour l'API:", payload);
      
      // Mettre à jour l'univers via l'API
      await ApiUnivers.editUnivers(universId, payload);
      
      // Mettre à jour l'état local
      setUniversInfo(prev => ({ ...prev, ...values }));
      
      // Recharger les données de l'univers pour s'assurer de la synchronisation
      console.log("Rechargement des données de l'univers...");
      const response = await ApiUnivers.getDetailUnivers(universId);
      const data = response.data;
      
      // Mettre à jour les informations de l'univers
      setUniversInfo({
        NomUnivers: data.name || "Univers",
        descriptionUnivers: data.description || "",
        image: data.image || "",
        tagsUnivers: [],
        selectVisibily: "Public",
        flagsCreate: []
      });
      
      // Mettre à jour le titre de la page
      if (data.name) {
        document.title = data.name;
      }
      
      console.log("Sauvegarde des informations terminée avec succès");
      setIsEditInfoOpen(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour des informations:", error);
      alert("Erreur lors de la sauvegarde des informations. Veuillez réessayer.");
    } finally {
      setIsInfoLoading(false);
    }
  };

  const handleSubmitCategories = (values) => {
    handleSaveModuleSelector(values);
  };

  const handleDeleteUnivers = async () => {
    setIsDeleteLoading(true);
    try {
      console.log("Début de la suppression de l'univers:", universId);
      
      // Supprimer l'univers via l'API
      await ApiUnivers.deleteUnivers(universId);
      
      console.log("Univers supprimé avec succès");
      
      // Fermer la modal
      setIsDeleteModalOpen(false);
      
      // Rediriger vers la page d'accueil ou la liste des univers
      navigate("/univers");
      
    } catch (error) {
      console.error("Erreur lors de la suppression de l'univers:", error);
      alert("Erreur lors de la suppression de l'univers. Veuillez réessayer.");
    } finally {
      setIsDeleteLoading(false);
    }
  };



  const resolveKey = useCallback((key) => {
    // Mapping des clés de catégories vers les noms de modules de l'API
    const keyMapping = {
      "tableau-affichage": "questLog",
      "Gallerie": "gallery",
      "ouverture": "inscription",
      "fiches": "fiche"
    };
    
    const moduleName = keyMapping[key] || key;
    
    // Mapping inverse pour obtenir la clé d'image
    const imageKeyMapping = {
      "questLog": "tableau",
      "gallery": "gallerie",
      "inscription": "ouverture",
      "fiche": "fiches"
    };
    
    const imageKey = imageKeyMapping[moduleName] || String(key || "").toLowerCase();
    console.log(`resolveKey: ${key} -> ${moduleName} -> ${imageKey}`);
    return imageKey;
  }, []);

  // Fonctions de gestion des clics pour les boutons d'action
  const handleEditImages = () => setIsEditImagesOpen(true);
  const handleToggleBackground = () => setIsBackgroundDisabled(prev => !prev);
  const handleOpenDeleteModal = () => setIsDeleteModalOpen(true);
  const handleEditInfo = () => setIsEditInfoOpen(true);
  const handleSelectCategories = () => setIsSelectCategoriesOpen(true);

  // Fonctions de fermeture des modales
  const handleCloseEditImages = () => setIsEditImagesOpen(false);
  const handleCloseDeleteModal = () => setIsDeleteModalOpen(false);
  const handleCloseEditInfo = () => setIsEditInfoOpen(false);
  const handleCloseSelectCategories = () => setIsSelectCategoriesOpen(false);

  // Affichage de l'erreur
  if (error) {
    return (
      <div className="UniId-page">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p style={{ color: 'red' }}>{error}</p>
          <button onClick={() => window.location.reload()}>Réessayer</button>
        </div>
      </div>
    );
  }

  const nav = [
    {
      name: "editImage",
	    handle: handleEditImages,
	    html: <FaPaintBrush size={12} />
    },
	  {
      name: "editInfo",
	    handle: handleEditInfo,
	    html: <FaEdit size={12} />
    },
	  {
      name: "selectCategories",
	    handle: handleSelectCategories,
	    html: <FaListUl size={12} />
    },
	  {
      name: "openDeleteModal",
	    handle: handleOpenDeleteModal,
	    html: <FaTrash size={12} />
    },
  ]

  return (
    <div
      className="UniId-page"
      style={!isBackgroundDisabled && images.bgImage ? {
        backgroundImage: `url(${images.bgImage})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      } : undefined}
    >
      {droits !== "read" && (
        <div className="UniId-left-dots">
          <button
            type="button"
            className="UniId-dot"
            title="Modifier les images"
            onClick={handleEditImages}
            aria-label="Ouvrir la fenêtre de modification des images"
          >
            <FaPaintBrush size={12} />
          </button>
          
          <button
            type="button"
            className="UniId-dot"
            title="Désactiver/Réactiver l'image d'arrière-plan"
            onClick={handleToggleBackground}
            aria-label="Basculer l'image d'arrière-plan"
          >
            <FaEyeSlash size={12} />
          </button>
          
          <button
            type="button"
            className="UniId-dot UniId-dot-danger"
            title="Supprimer l'univers"
            onClick={handleOpenDeleteModal}
            aria-label="Supprimer l'univers"
          >
            <FaTrash size={12} />
          </button>
          
          <button
            type="button"
            className="UniId-dot UniId-dot-info"
            title="Modifier les informations de l'univers"
            onClick={handleEditInfo}
            aria-label="Modifier les informations de l'univers"
          >
            <FaEdit size={12} />
          </button>
          
          <button
            type="button"
            className="UniId-dot"
            title="Sélectionner les catégories affichées"
            onClick={handleSelectCategories}
            aria-label="Sélectionner les catégories affichées"
          >
            <FaListUl size={12} />
          </button>
        </div>
      )}

             <h1 className="UniId-title">{universInfo.NomUnivers}</h1>
       {universInfo.descriptionUnivers && universInfo.descriptionUnivers.trim() !== '' && universInfo.descriptionUnivers !== '<p></p>' && (
         <div 
           className="UniId-text" 
           dangerouslySetInnerHTML={{ __html: universInfo.descriptionUnivers }} 
         />
       )}

             <div className="UniId-grid">
         {CATEGORIES.filter((item) => visibleCategories.includes(item.label)).map((item) => {
           const imageKey = resolveKey(item.key);
           const imageUrl = images[imageKey] || ffimg;
           console.log(`Rendu carte ${item.label}: clé=${imageKey}, image=${imageUrl}`);
           
           return (
             <button
               key={item.key}
               className="UniId-card"
               style={{ "--thumb": `url(${imageUrl})` }}
               onClick={() => navigate(item.to)}
               type="button"
             >
               <span className="UniId-label">{item.label}</span>
             </button>
           );
         })}
       </div>

             <ModalGeneric
         onClose={handleCloseEditImages}
         handleSubmit={handleSubmitImages}
         initialData={images}
         fields={fields}
         name="univers-images-modal"
         isOpen={isEditImagesOpen}
         title="Images"
         textButtonValidate={isImagesLoading ? "Sauvegarde..." : "Sauvegarder"}
         nav={nav}
       />

             {/* Modal de confirmation de suppression */}
       <ModalGeneric
         onClose={handleCloseDeleteModal}
         handleSubmit={handleDeleteUnivers}
         initialData={{}}
         fields={deleteFields}
         name="univers-delete-modal"
         isOpen={isDeleteModalOpen}
         title="Confirmer la suppression"
         textButtonValidate={isDeleteLoading ? "Suppression..." : "Supprimer"}
         noButtonCancel={false}
         nav={nav}
       />

             {/* Modal de modification des informations */}
       <ModalGeneric
         onClose={handleCloseEditInfo}
         handleSubmit={handleSubmitInfo}
         initialData={universInfo}
         fields={infoFields}
         name="univers-info-modal"
         isOpen={isEditInfoOpen}
         title="Modifier l'univers"
         textButtonValidate={isInfoLoading ? "Sauvegarde..." : "Sauvegarder"}
         noButtonCancel={false}
         nav={nav}
       />

      {/* Modal de sélection des catégories affichées */}
      <ModalGeneric
        onClose={handleCloseSelectCategories}
        handleSubmit={handleSubmitCategories}
        initialData={{ selectedModules: listModule }}
        fields={categoriesFields}
        name="univers-select-categories-modal"
        isOpen={isSelectCategoriesOpen}
        title="Sélectionner les modules"
        textButtonValidate="Sauvegarder"
        noButtonCancel={false}
        nav={nav}
      />
    </div>
  );
};

export default Univers;
