function getChildIndex(xElement) {
  return Array.from(xElement.parentElement.children).indexOf(xElement);
}

let firstElement = null;
let ghostElement = null;

// Attacher les événements aux cartes
document.querySelectorAll('.tm-cards > div').forEach(div => {
  div.addEventListener('mousedown', (e) => {
    firstElement = e.currentTarget;

    // Création du fantôme visuel
    ghostElement = firstElement.cloneNode(true);
    ghostElement.style.position = 'absolute';
    ghostElement.style.pointerEvents = 'none';
    ghostElement.style.opacity = '0.7';
    ghostElement.style.zIndex = '9999';
    ghostElement.style.width = `${firstElement.offsetWidth/2}px`;
    ghostElement.style.border = '2px dashed #ccc';

    // Ajout à la page
    document.body.appendChild(ghostElement);
    moveGhost(e.pageX, e.pageY);

    // Activer le suivi souris
    document.addEventListener('mousemove', onMouseMove);
  });
});

// Déplacement du fantôme
function moveGhost(x, y) {
  const offsetX = 20;
  const offsetY = 20;
  if (ghostElement) {
    ghostElement.style.left = `${x + offsetX}px`;
    ghostElement.style.top = `${y + offsetY}px`;
  }
}

// Mise à jour de la position du fantôme
function onMouseMove(e) {
  moveGhost(e.pageX, e.pageY);
}

document.addEventListener('mouseup', (e) => {
  const secondElement = e.target.closest('.tm-cards > div');

  if (firstElement && secondElement && firstElement !== secondElement) {
    const data = {
      idCard: firstElement.getAttribute('data-id'),
      oldPos: getChildIndex(firstElement),
      newPos: getChildIndex(secondElement),
      oldTab: firstElement.parentElement.getAttribute('data-id'),
      newTab: secondElement.parentElement.getAttribute('data-id')
    };
    console.log(data);
  }

  // Nettoyage du fantôme
  if (ghostElement) {
    ghostElement.remove();
    ghostElement = null;
    document.removeEventListener('mousemove', onMouseMove);
  }

  firstElement = null;
});