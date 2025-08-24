import React, { useCallback, useEffect, useState, useRef } from "react";
import { FicheNav } from "@components"; 
import "../../../pages/fiche/CreateFiche.css";
import { ApiService } from "@service";
import "./FicheCard.css"
import { useTranslation } from "react-i18next";


const FicheCardStory = ({ activeTab, indexModule, setActiveTab, data, onEdit }) => {
  const { t } = useTranslation("common");
  const extraData = (data.module === undefined) ? {} : data.module[indexModule]?.extra;

  const [resolvedValues, setResolvedValues] = useState(extraData);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState(null);
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
      const chaptersWithContent = Object.entries(resolvedValues).filter(([key, value]) => {
        return key.startsWith('nC-') && hasContent(value);
      });
      
      if (chaptersWithContent.length > 0) {

        setSelectedChapter(chaptersWithContent[0][0]);
      } else {
        setSelectedChapter(null);
      }
    } else {
      setSelectedChapter(null);
    }
  }, [resolvedValues]);


  const handleEdit = useCallback(() => {
    onEdit();
  }, [onEdit]);

  const getChapterName = (key) => {
    if (key.startsWith('nC-')) {
      return key.substring(3); // Enlève "nC-" et garde le reste
    }
    return key;
  };

  const hasContent = (value) => {
    return value && value.trim() !== '' && value !== '<p></p>';
  };

  const chaptersWithContent = Object.entries(resolvedValues).filter(([key, value]) => {
    return key.startsWith('nC-') && hasContent(value);
  });

  const handleChapterChange = (chapterKey) => {
    setSelectedChapter(chapterKey);
  };


  return (
    <div className="cf-content">
      <FicheNav activeTab={activeTab} setActiveTab={setActiveTab} data={data} />
      
      <h2 className="cf-h2">{t("story")}</h2>
      
      {isLoading ? (
        <p>{t("loadingChapters")}</p>
      ) : chaptersWithContent.length > 0 ? (
        <>
          {/* Sélection des chapitres - boutons si ≤ 5, dropdown si > 5 */}
          {chaptersWithContent.length <= 5 ? (
            <div className="chapter-buttons">
              {chaptersWithContent.map(([key, value]) => (
                <button
                  key={key}
                  className={`chapter-btn ${selectedChapter === key ? 'active' : ''}`}
                  onClick={() => handleChapterChange(key)}
                >
                  {getChapterName(key)}
                </button>
              ))}
            </div>
          ) : (
            <div className="chapter-select-container">
              <select
                className="chapter-select"
                value={selectedChapter || ''}
                onChange={(e) => handleChapterChange(e.target.value)}
              >
                {chaptersWithContent.map(([key, value]) => (
                  <option key={key} value={key}>
                    {getChapterName(key)}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Contenu du chapitre sélectionné */}
          {selectedChapter && resolvedValues[selectedChapter] && (
            <div className="cf-text storytext">
              <div dangerouslySetInnerHTML={{ __html: resolvedValues[selectedChapter] }} />
            </div>
          )}
        </>
      ) : (
        <p>{t("noChaptersAvailable")}</p>
      )}

      {data.droit === "write" && (
        <button className="cf-edit-btn" onClick={handleEdit}>✏️ {t("edit")}</button>
      )}
    </div>
  );
};

export default FicheCardStory;