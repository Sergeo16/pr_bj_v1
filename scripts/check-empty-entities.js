#!/usr/bin/env node

/**
 * Script pour vérifier les rubriques vides dans le fichier JSON
 */

const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', 'data', 'BENIN_centres_vote_complet.json');

console.log('🔍 Analyse du fichier JSON pour trouver les rubriques vides...\n');

try {
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  
  const emptyDepartements = [];
  const emptyCommunes = [];
  const emptyArrondissements = [];
  const emptyVillages = [];
  const emptyCentres = [];
  
  // Parcourir tous les départements (les clés de l'objet)
  Object.keys(data).forEach((depKey) => {
    const departement = data[depKey];
    const depName = depKey;
    
    // Vérifier si le département a des communes
    if (!departement.communes || Object.keys(departement.communes || {}).length === 0) {
      emptyDepartements.push({
        nom: depName
      });
    } else {
      // Parcourir les communes
      Object.keys(departement.communes).forEach((comKey) => {
        const commune = departement.communes[comKey];
        const comName = comKey;
        const fullComName = `${depName} > ${comName}`;
        
        // Vérifier si la commune a des arrondissements
        if (!commune.arrondissements || Object.keys(commune.arrondissements || {}).length === 0) {
          emptyCommunes.push({
            nom: fullComName,
            departement: depName,
            commune: comName
          });
        } else {
          // Parcourir les arrondissements
          Object.keys(commune.arrondissements).forEach((arrKey) => {
            const arrondissement = commune.arrondissements[arrKey];
            const arrName = arrKey;
            const fullArrName = `${depName} > ${comName} > ${arrName}`;
            
            // Vérifier si l'arrondissement a des villages
            if (!arrondissement.villages || Object.keys(arrondissement.villages || {}).length === 0) {
              emptyArrondissements.push({
                nom: fullArrName,
                departement: depName,
                commune: comName,
                arrondissement: arrName
              });
            } else {
              // Parcourir les villages
              Object.keys(arrondissement.villages).forEach((vilKey) => {
                const village = arrondissement.villages[vilKey];
                const vilName = vilKey;
                const fullVilName = `${depName} > ${comName} > ${arrName} > ${vilName}`;
                
                // Vérifier si le village a des centres
                if (!village.centres || village.centres.length === 0) {
                  emptyVillages.push({
                    nom: fullVilName,
                    departement: depName,
                    commune: comName,
                    arrondissement: arrName,
                    village: vilName
                  });
                } else {
                  // Parcourir les centres
                  village.centres.forEach((centre, cenIndex) => {
                    let cenName = '';
                    if (typeof centre === 'string') {
                      cenName = centre || `Centre ${cenIndex + 1}`;
                    } else if (centre && typeof centre === 'object') {
                      cenName = centre.libelle || centre.nom || centre.code || `Centre ${cenIndex + 1}`;
                    } else {
                      cenName = `Centre ${cenIndex + 1}`;
                    }
                    const fullCenName = `${depName} > ${comName} > ${arrName} > ${vilName} > ${cenName}`;
                    
                    // Vérifier si le centre est vide (pas de libelle/nom ou libelle/nom vide)
                    let isEmpty = false;
                    if (typeof centre === 'string') {
                      isEmpty = !centre || centre.trim() === '';
                    } else if (centre && typeof centre === 'object') {
                      const libelle = centre.libelle || centre.nom || '';
                      isEmpty = !libelle || libelle.trim() === '';
                    } else {
                      isEmpty = true;
                    }
                    
                    if (isEmpty) {
                      emptyCentres.push({
                        nom: fullCenName,
                        departement: depName,
                        commune: comName,
                        arrondissement: arrName,
                        village: vilName,
                        centre: cenName,
                        code: centre && centre.code ? centre.code : ''
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  });
  
  // Afficher les résultats
  console.log('📊 RÉSULTATS DE L\'ANALYSE\n');
  console.log('═'.repeat(60));
  
  if (emptyDepartements.length > 0) {
    console.log(`\n❌ DÉPARTEMENTS VIDES (${emptyDepartements.length}):`);
    console.log('-'.repeat(60));
    emptyDepartements.forEach(dep => {
      console.log(`  • ${dep.nom}`);
    });
  } else {
    console.log('\n✅ DÉPARTEMENTS: Aucun département vide');
  }
  
  if (emptyCommunes.length > 0) {
    console.log(`\n❌ COMMUNES VIDES (${emptyCommunes.length}):`);
    console.log('-'.repeat(60));
    emptyCommunes.forEach(com => {
      console.log(`  • ${com.nom}`);
    });
  } else {
    console.log('\n✅ COMMUNES: Aucune commune vide');
  }
  
  if (emptyArrondissements.length > 0) {
    console.log(`\n❌ ARRONDISSEMENTS VIDES (${emptyArrondissements.length}):`);
    console.log('-'.repeat(60));
    emptyArrondissements.forEach(arr => {
      console.log(`  • ${arr.nom}`);
    });
  } else {
    console.log('\n✅ ARRONDISSEMENTS: Aucun arrondissement vide');
  }
  
  if (emptyVillages.length > 0) {
    console.log(`\n❌ VILLAGES VIDES (${emptyVillages.length}):`);
    console.log('-'.repeat(60));
    emptyVillages.forEach(vil => {
      console.log(`  • ${vil.nom}`);
    });
  } else {
    console.log('\n✅ VILLAGES: Aucun village vide');
  }
  
  if (emptyCentres.length > 0) {
    console.log(`\n❌ CENTRES VIDES (${emptyCentres.length}):`);
    console.log('-'.repeat(60));
    emptyCentres.forEach(cen => {
      console.log(`  • ${cen.nom}`);
    });
  } else {
    console.log('\n✅ CENTRES: Aucun centre vide');
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('\n📈 RÉSUMÉ:');
  console.log(`  - Départements vides: ${emptyDepartements.length}`);
  console.log(`  - Communes vides: ${emptyCommunes.length}`);
  console.log(`  - Arrondissements vides: ${emptyArrondissements.length}`);
  console.log(`  - Villages vides: ${emptyVillages.length}`);
  console.log(`  - Centres vides: ${emptyCentres.length}`);
  
} catch (error) {
  console.error('❌ Erreur lors de l\'analyse:', error.message);
  process.exit(1);
}

