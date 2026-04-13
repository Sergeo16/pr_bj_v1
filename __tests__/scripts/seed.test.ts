import { readFileSync } from 'fs';
import { join } from 'path';

// Mock test pour vérifier que le fichier JSON existe et est valide
describe('Seed Script', () => {
  it('should have valid JSON data file', () => {
    const dataFile = readFileSync(
      join(process.cwd(), 'data', 'BENIN_centres_vote_complet.json'),
      'utf-8'
    );
    
    expect(() => {
      JSON.parse(dataFile);
    }).not.toThrow();
    
    const data = JSON.parse(dataFile);
    expect(typeof data).toBe('object');
    expect(data).not.toBeNull();
    const departementsList = Object.values(data);
    expect(departementsList.length).toBeGreaterThan(0);
  });

  it('should have correct structure', () => {
    const dataFile = readFileSync(
      join(process.cwd(), 'data', 'BENIN_centres_vote_complet.json'),
      'utf-8'
    );
    const data = JSON.parse(dataFile);
    const departementsList = Object.values(data);
    
    if (departementsList.length > 0) {
      const firstDept = departementsList[0] as any;
      expect(firstDept).toHaveProperty('departement');
      expect(firstDept).toHaveProperty('communes');
      
      const firstCommune = Object.values(firstDept.communes)[0] as any;
      if (firstCommune) {
        expect(firstCommune).toHaveProperty('arrondissements');
      }
    }
  });
});

