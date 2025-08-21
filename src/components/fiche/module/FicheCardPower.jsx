import React, { useCallback, useEffect, useState, useRef } from "react";
import { FicheNav } from "@components"; 
import "../../../pages/fiche/CreateFiche.css";
import { ApiService } from "@service";
import "./FicheCard.css";

const FicheCardPower = ({ activeTab, indexModule, setActiveTab, data, onEdit }) => {
  const extraData = (data.module === undefined) ? {} : data.module[indexModule]?.extra;

  const [resolvedValues, setResolvedValues] = useState(extraData);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPower, setSelectedPower] = useState(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    
    if (extraData && Object.keys(extraData).length > 0) {
      setResolvedValues(extraData);
      setIsLoading(true);
    } else {
      setResolvedValues({});
      setIsLoading(false);
    }
  }, [extraData, indexModule]);

  useEffect(() => {
    if (!extraData || Object.keys(extraData).length === 0 || !isLoading) {
      return;
    }

    const processAliases = async () => {
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const aliasRegex = /\$\$(\d+)\$\$/g;
      const foundNumbers = new Set();

      Object.values(extraData).forEach((val) => {
        if (typeof val === "string") {
          let match;
          while ((match = aliasRegex.exec(val)) !== null) {
            foundNumbers.add(match[1]);
          }
        }
      });

      if (foundNumbers.size === 0) {
        setResolvedValues(extraData);
        setIsLoading(false);
        return;
      }

      try {
        const aliasModule = await ApiService.getAliasModule(Array.from(foundNumbers));
        
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        const aliasMap = aliasModule.data;

        const processedValues = Object.fromEntries(
          Object.entries(extraData).map(([key, val]) => {
            if (typeof val === "string") {
              const replaced = val.replace(aliasRegex, (_, num) => {
                const replacement = aliasMap[num];
                return replacement || `$$${num}$$`;
              });
              return [key, replaced];
            }
            return [key, val];
          })
        );
        setResolvedValues(processedValues);
      } catch (error) {
        if (error.name === 'AbortError') {
          return;
        }
        setResolvedValues(extraData);
      } finally {
        setIsLoading(false);
      }
    };

    processAliases();
  }, [extraData, isLoading]);

  useEffect(() => {
    if (resolvedValues && Object.keys(resolvedValues).length > 0) {
      const powersWithContent = getPowers();
      
      if (powersWithContent.length > 0) {
        setSelectedPower(powersWithContent[0].id);
      } else {
        setSelectedPower(null);
      }
    } else {
      setSelectedPower(null);
    }
  }, [resolvedValues]);

  const handleEdit = useCallback(() => {
    onEdit();
  }, [onEdit]);

  const hasContent = (value) => {
    return value && value.trim() !== '' && value !== '<p></p>';
  };

  // Extraire les pouvoirs à partir des données
  const getPowers = () => {
    const powers = [];
    const powerEntries = Object.entries(resolvedValues);
    
    // Grouper les inputText et inputTextarea par index
    const powerGroups = {};
    
    powerEntries.forEach(([key, value]) => {
      if (key.startsWith('inputText') && key.match(/inputText(\d+)/)) {
        const index = key.match(/inputText(\d+)/)[1];
        if (!powerGroups[index]) {
          powerGroups[index] = {};
        }
        powerGroups[index].name = value;
      } else if (key.startsWith('inputTextarea') && key.match(/inputTextarea(\d+)/)) {
        const index = key.match(/inputTextarea(\d+)/)[1];
        if (!powerGroups[index]) {
          powerGroups[index] = {};
        }
        powerGroups[index].description = value;
      }
    });

    // Convertir en tableau de pouvoirs
    Object.entries(powerGroups).forEach(([index, power]) => {
      if (power.name && hasContent(power.name)) {
        powers.push({
          id: index,
          name: power.name,
          description: power.description || ''
        });
      }
    });

    return powers;
  };

  const powers = getPowers();

  const handlePowerChange = (powerId) => {
    setSelectedPower(powerId);
  };

  const selectedPowerData = powers.find(power => power.id === selectedPower);

  return (
    <div className="cf-content">
      <FicheNav activeTab={activeTab} setActiveTab={setActiveTab} data={data} />
      
      <h2 className="cf-h2">Pouvoirs</h2>
      
      {isLoading ? (
        <p>Chargement des pouvoirs...</p>
      ) : powers.length > 0 ? (
        <>
          {/* Boutons des pouvoirs */}
          <div className="chapter-buttons">
            {powers.map((power) => (
              <button
                key={power.id}
                className={`chapter-btn ${selectedPower === power.id ? 'active' : ''}`}
                onClick={() => handlePowerChange(power.id)}
              >
                {power.name}
              </button>
            ))}
          </div>
          
          {/* Contenu du pouvoir sélectionné */}
          {selectedPowerData && (
            <div className="cf-text power-content">
              {selectedPowerData.description && hasContent(selectedPowerData.description) && (
                <div className="power-description">
                  <div dangerouslySetInnerHTML={{ __html: selectedPowerData.description }} />
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <p>Aucun pouvoir disponible</p>
      )}

      <button className="cf-edit-btn" onClick={handleEdit}>✏️ Modifier</button>
    </div>
  );
};

export default FicheCardPower;