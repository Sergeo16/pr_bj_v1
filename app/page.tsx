'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

interface Option {
  id: number;
  name: string;
}

interface BureauVote {
  id: number;
  name: string;
}

interface BureauVoteData {
  bureauVoteId: number | null;
  inscrits: number;
  votants: number;
  bulletinsNuls: number;
  bulletinsBlancs: number;
  suffragesExprimes: number;
  voixWadagniTalata: number;
  voixHounkpeHounwanou: number;
  observations: string;
  showObservations: boolean;
}

export default function HomePage() {
  const [fullName, setFullName] = useState('');
  const [departements, setDepartements] = useState<Option[]>([]);
  const [selectedDepartement, setSelectedDepartement] = useState<number | null>(null);
  const [communes, setCommunes] = useState<Option[]>([]);
  const [selectedCommune, setSelectedCommune] = useState<number | null>(null);
  const [arrondissements, setArrondissements] = useState<Option[]>([]);
  const [selectedArrondissement, setSelectedArrondissement] = useState<number | null>(null);
  const [villages, setVillages] = useState<Option[]>([]);
  const [selectedVillage, setSelectedVillage] = useState<number | null>(null);
  const [centres, setCentres] = useState<Option[]>([]);
  const [selectedCentre, setSelectedCentre] = useState<number | null>(null);
  const [bureaux, setBureaux] = useState<BureauVote[]>([]);
  const [bureauxVote, setBureauxVote] = useState<BureauVoteData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<number, Set<string>>>({});
  const scrollPositionRef = useRef<number>(0);

  // Charger les départements
  useEffect(() => {
    fetch('/api/regions/departements')
      .then((res) => res.json())
      .then((data) => {
        if (data.departements) {
          setDepartements(data.departements);
        }
      })
      .catch(console.error);
  }, []);

  // Sauvegarder la position du scroll avant les changements
  useEffect(() => {
    const handleScroll = () => {
      scrollPositionRef.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Charger les communes quand un département est sélectionné
  useEffect(() => {
    if (selectedDepartement) {
      scrollPositionRef.current = window.scrollY;
      
      fetch(`/api/regions/communes?departementId=${selectedDepartement}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.communes) {
            setCommunes(data.communes);
          }
          // Restaurer la position du scroll après le re-render
          setTimeout(() => {
            window.scrollTo({ top: scrollPositionRef.current, behavior: 'instant' });
          }, 0);
        })
        .catch(console.error);
      // Réinitialiser les sélections dépendantes
      setSelectedCommune(null);
      setSelectedArrondissement(null);
      setSelectedVillage(null);
      setSelectedCentre(null);
      setArrondissements([]);
      setVillages([]);
      setCentres([]);
      setBureaux([]);
      setBureauxVote([]);
    }
  }, [selectedDepartement]);

  // Charger les arrondissements quand une commune est sélectionnée
  useEffect(() => {
    if (selectedCommune) {
      scrollPositionRef.current = window.scrollY;
      
      fetch(`/api/regions/arrondissements?communeId=${selectedCommune}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.arrondissements) {
            setArrondissements(data.arrondissements);
          }
          setTimeout(() => {
            window.scrollTo({ top: scrollPositionRef.current, behavior: 'instant' });
          }, 0);
        })
        .catch(console.error);
      setSelectedArrondissement(null);
      setSelectedVillage(null);
      setSelectedCentre(null);
      setVillages([]);
      setCentres([]);
      setBureaux([]);
      setBureauxVote([]);
    }
  }, [selectedCommune]);

  // Charger les villages quand un arrondissement est sélectionné
  useEffect(() => {
    if (selectedArrondissement) {
      scrollPositionRef.current = window.scrollY;
      
      fetch(`/api/regions/villages?arrondissementId=${selectedArrondissement}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.villages) {
            setVillages(data.villages);
          }
          setTimeout(() => {
            window.scrollTo({ top: scrollPositionRef.current, behavior: 'instant' });
          }, 0);
        })
        .catch(console.error);
      setSelectedVillage(null);
      setSelectedCentre(null);
      setCentres([]);
      setBureaux([]);
      setBureauxVote([]);
    }
  }, [selectedArrondissement]);

  // Charger les centres quand un village est sélectionné
  useEffect(() => {
    if (selectedVillage) {
      scrollPositionRef.current = window.scrollY;
      
      fetch(`/api/regions/centres?villageId=${selectedVillage}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.centres) {
            setCentres(data.centres);
          }
          setTimeout(() => {
            window.scrollTo({ top: scrollPositionRef.current, behavior: 'instant' });
          }, 0);
        })
        .catch(console.error);
      setSelectedCentre(null);
      setBureaux([]);
      setBureauxVote([]);
    }
  }, [selectedVillage]);

  // Définir les bureaux de vote fixes quand un centre est sélectionné
  useEffect(() => {
    if (selectedCentre) {
      // Liste fixe de bureaux de vote (sera mise à jour plus tard avec les vrais noms)
      setBureaux([
        { id: 1, name: 'Bureau de vote 1' },
        { id: 2, name: 'Bureau de vote 2' },
      ]);
    } else {
      setBureaux([]);
      setBureauxVote([]);
    }
  }, [selectedCentre]);

  const addBureauVote = () => {
    setBureauxVote([
      ...bureauxVote,
      {
        bureauVoteId: null,
        inscrits: 0,
        votants: 0,
        bulletinsNuls: 0,
        bulletinsBlancs: 0,
        suffragesExprimes: 0,
        voixWadagniTalata: 0,
        voixHounkpeHounwanou: 0,
        observations: '',
        showObservations: false,
      },
    ]);
  };

  const removeBureauVote = (index: number) => {
    setBureauxVote(bureauxVote.filter((_, i) => i !== index));
  };

  const updateBureauVote = (index: number, field: keyof BureauVoteData, value: any) => {
    const updated = [...bureauxVote];
    updated[index] = { ...updated[index], [field]: value };
    setBureauxVote(updated);
  };

  const toggleObservations = (index: number) => {
    const updated = [...bureauxVote];
    updated[index].showObservations = !updated[index].showObservations;
    setBureauxVote(updated);
  };

  const validateBureauVote = (bureau: BureauVoteData, index: number): { errors: Set<string>; message: string | null } => {
    const errors = new Set<string>();
    let message: string | null = null;

    if (bureau.votants > bureau.inscrits) {
      errors.add('votants');
      message = 'Le nombre de votants doit être inférieur ou égal au nombre d\'inscrits';
    }
    if (bureau.suffragesExprimes > bureau.votants) {
      errors.add('suffragesExprimes');
      if (!message) message = 'Le nombre de suffrages exprimés doit être inférieur ou égal au nombre de votants';
    }
    if (bureau.bulletinsNuls > bureau.votants) {
      errors.add('bulletinsNuls');
      if (!message) message = 'Le nombre de bulletins nuls doit être inférieur ou égal au nombre de votants';
    }
    if (bureau.bulletinsBlancs > bureau.votants) {
      errors.add('bulletinsBlancs');
      if (!message) message = 'Le nombre de bulletins blancs doit être inférieur ou égal au nombre de votants';
    }
    // Vérifier que Votants = Suffrages exprimés + Bulletins nuls + Bulletins blancs
    const totalBulletins = bureau.suffragesExprimes + bureau.bulletinsNuls + bureau.bulletinsBlancs;
    if (bureau.votants !== totalBulletins) {
      errors.add('votants');
      errors.add('suffragesExprimes');
      errors.add('bulletinsNuls');
      errors.add('bulletinsBlancs');
      if (!message) {
        message = `Le nombre de votants (${bureau.votants}) doit être égal à la somme des suffrages exprimés (${bureau.suffragesExprimes}) + bulletins nuls (${bureau.bulletinsNuls}) + bulletins blancs (${bureau.bulletinsBlancs}) = ${totalBulletins}`;
      }
    }
    // Vérifier que Suffrages exprimés = somme des deux duos
    const totalVoix = bureau.voixWadagniTalata + bureau.voixHounkpeHounwanou;
    if (bureau.suffragesExprimes !== totalVoix) {
      errors.add('suffragesExprimes');
      errors.add('voixWadagniTalata');
      errors.add('voixHounkpeHounwanou');
      if (!message) {
        message = `Le nombre de suffrages exprimés (${bureau.suffragesExprimes}) doit être égal à la somme des voix des deux duos (${bureau.voixWadagniTalata} + ${bureau.voixHounkpeHounwanou} = ${totalVoix})`;
      }
    }

    return { errors, message };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !fullName ||
      !selectedDepartement ||
      !selectedCommune ||
      !selectedArrondissement ||
      !selectedVillage ||
      !selectedCentre ||
      bureauxVote.length === 0
    ) {
      toast.error('Veuillez remplir tous les champs et ajouter au moins un bureau de vote');
      return;
    }

    // Vérifier que tous les bureaux de vote ont un bureau sélectionné
    if (bureauxVote.some(bv => !bv.bureauVoteId)) {
      toast.error('Veuillez sélectionner un bureau de vote pour chaque entrée');
      return;
    }

    // Valider les contraintes pour chaque bureau de vote
    const newValidationErrors: Record<number, Set<string>> = {};
    for (let i = 0; i < bureauxVote.length; i++) {
      const { errors, message } = validateBureauVote(bureauxVote[i], i);
      if (errors.size > 0) {
        newValidationErrors[i] = errors;
        if (message) {
          toast.error(`Bureau de vote ${i + 1}: ${message}`);
        }
      }
    }
    
    // S'il y a des erreurs, mettre à jour l'état et arrêter
    if (Object.keys(newValidationErrors).length > 0) {
      setValidationErrors(newValidationErrors);
      return;
    }
    
    // Réinitialiser les erreurs si tout est valide
    setValidationErrors({});

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          departementId: selectedDepartement,
          communeId: selectedCommune,
          arrondissementId: selectedArrondissement,
          villageId: selectedVillage,
          centreId: selectedCentre,
          bureauxVote,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Vote enregistré avec succès!');
        // Réinitialiser le formulaire
        setFullName('');
        setSelectedDepartement(null);
        setSelectedCommune(null);
        setSelectedArrondissement(null);
        setSelectedVillage(null);
        setSelectedCentre(null);
        setBureauxVote([]);
        setValidationErrors({});
      } else {
        toast.error(data.error || 'Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFullName('');
    setSelectedDepartement(null);
    setSelectedCommune(null);
    setSelectedArrondissement(null);
    setSelectedVillage(null);
    setSelectedCentre(null);
    setBureauxVote([]);
    toast.error('Formulaire annulé');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-0 pb-8 sm:pb-12">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">Présidentielle 2026 au Bénin</h1>

      <form 
        onSubmit={handleSubmit} 
        className="card bg-base-100 shadow-xl transition-all duration-300 hover:outline hover:outline-[4px] hover:outline-accent hover:outline-offset-2"
      >
        <div className="card-body p-4 sm:p-6 pb-8">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Votre nom et prénoms *</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              placeholder="Saisissez votre nom et prénoms"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Choisir un département *</span>
            </label>
            <select
              className="select select-bordered"
              value={selectedDepartement || ''}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedDepartement(value ? parseInt(value, 10) : null);
              }}
              required
            >
              <option value="">Sélectionnez un département</option>
              {departements.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Choisir une commune *</span>
            </label>
            <select
              className="select select-bordered"
              value={selectedCommune || ''}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedCommune(value ? parseInt(value, 10) : null);
              }}
              required
              disabled={!selectedDepartement}
            >
              <option value="">Sélectionnez une commune</option>
              {communes.map((commune) => (
                <option key={commune.id} value={commune.id}>
                  {commune.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Choisir un arrondissement *</span>
            </label>
            <select
              className="select select-bordered"
              value={selectedArrondissement || ''}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedArrondissement(value ? parseInt(value, 10) : null);
              }}
              required
              disabled={!selectedCommune}
            >
              <option value="">Sélectionnez un arrondissement</option>
              {arrondissements.map((arr) => (
                <option key={arr.id} value={arr.id}>
                  {arr.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Choisir un village / quartier *</span>
            </label>
            <select
              className="select select-bordered"
              value={selectedVillage || ''}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedVillage(value ? parseInt(value, 10) : null);
              }}
              required
              disabled={!selectedArrondissement}
            >
              <option value="">Sélectionnez un village / quartier</option>
              {villages.map((village) => (
                <option key={village.id} value={village.id}>
                  {village.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Choisir un centre de vote *</span>
            </label>
            <select
              className="select select-bordered"
              value={selectedCentre || ''}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedCentre(value ? parseInt(value, 10) : null);
              }}
              required
              disabled={!selectedVillage}
            >
              <option value="">Sélectionnez un centre de vote</option>
              {centres.map((centre) => (
                <option key={centre.id} value={centre.id}>
                  {centre.name}
                </option>
              ))}
            </select>
          </div>

          {/* Bureaux de vote */}
          {selectedCentre && (
            <div className="form-control mt-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 mb-2">
                <h3 className="text-lg font-semibold whitespace-nowrap">Bureaux de vote</h3>
                <button
                  type="button"
                  onClick={addBureauVote}
                  className="btn btn-primary btn-sm whitespace-nowrap w-full sm:w-auto"
                >
                  + Ajouter un Bureau de vote
                </button>
              </div>

              {bureauxVote.map((bureau, index) => (
                <div key={index} className="card bg-base-200 p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">Bureau de vote {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeBureauVote(index)}
                      className="btn btn-error btn-sm"
                    >
                      Supprimer
                    </button>
                  </div>

                  <div className="form-control mb-2">
                    <label className="label">
                      <span className="label-text">Choisir un bureau de vote *</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={bureau.bureauVoteId || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateBureauVote(index, 'bureauVoteId', value ? parseInt(value, 10) : null);
                      }}
                      required
                    >
                      <option value="">Sélectionnez un bureau</option>
                      {bureaux.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Inscrits *</span>
                      </label>
                      <input
                        type="number"
                        className="input input-bordered"
                        placeholder="0"
                        value={bureau.inscrits}
                        onChange={(e) => updateBureauVote(index, 'inscrits', parseInt(e.target.value) || 0)}
                        onFocus={(e) => e.target.select()}
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                        min="0"
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Votants *</span>
                      </label>
                      <input
                        type="number"
                        className={`input input-bordered ${
                          validationErrors[index]?.has('votants') ? 'input-error' : ''
                        }`}
                        placeholder="0"
                        value={bureau.votants}
                        onChange={(e) => updateBureauVote(index, 'votants', parseInt(e.target.value) || 0)}
                        onFocus={(e) => e.target.select()}
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                        max={bureau.inscrits}
                        min="0"
                        required
                      />
                      {validationErrors[index]?.has('votants') && (
                        <label className="label">
                          <span className="label-text-alt text-error">
                            Erreur de validation sur le champ Votants
                          </span>
                        </label>
                      )}
                      {bureau.inscrits > 0 && (
                        <label className="label">
                          <span className="label-text-alt text-info">
                            Taux de participation: {((bureau.votants / bureau.inscrits) * 100).toFixed(2)}%
                          </span>
                        </label>
                      )}
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Bulletins nuls *</span>
                      </label>
                      <input
                        type="number"
                        className={`input input-bordered ${
                          validationErrors[index]?.has('bulletinsNuls') ? 'input-error' : ''
                        }`}
                        placeholder="0"
                        value={bureau.bulletinsNuls}
                        onChange={(e) => updateBureauVote(index, 'bulletinsNuls', parseInt(e.target.value) || 0)}
                        onFocus={(e) => e.target.select()}
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                        max={bureau.votants}
                        min="0"
                        required
                      />
                      {validationErrors[index]?.has('bulletinsNuls') && (
                        <label className="label">
                          <span className="label-text-alt text-error">
                            Erreur de validation sur le champ Bulletins nuls
                          </span>
                        </label>
                      )}
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Bulletins blancs *</span>
                      </label>
                      <input
                        type="number"
                        className={`input input-bordered ${
                          validationErrors[index]?.has('bulletinsBlancs') ? 'input-error' : ''
                        }`}
                        placeholder="0"
                        value={bureau.bulletinsBlancs}
                        onChange={(e) => updateBureauVote(index, 'bulletinsBlancs', parseInt(e.target.value) || 0)}
                        onFocus={(e) => e.target.select()}
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                        max={bureau.votants}
                        min="0"
                        required
                      />
                      {validationErrors[index]?.has('bulletinsBlancs') && (
                        <label className="label">
                          <span className="label-text-alt text-error">
                            Erreur de validation sur le champ Bulletins blancs
                          </span>
                        </label>
                      )}
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Suffrages valablement exprimés *</span>
                      </label>
                      <input
                        type="number"
                        className={`input input-bordered ${
                          validationErrors[index]?.has('suffragesExprimes') ? 'input-error' : ''
                        }`}
                        placeholder="0"
                        value={bureau.suffragesExprimes}
                        onChange={(e) => updateBureauVote(index, 'suffragesExprimes', parseInt(e.target.value) || 0)}
                        onFocus={(e) => e.target.select()}
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                        max={bureau.votants}
                        min="0"
                        required
                      />
                      {validationErrors[index]?.has('suffragesExprimes') && (
                        <label className="label">
                          <span className="label-text-alt text-error">
                            Erreur de validation sur le champ Suffrages exprimés
                          </span>
                        </label>
                      )}
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">WADAGNI - TALATA *</span>
                      </label>
                      <input
                        type="number"
                        className={`input input-bordered ${
                          validationErrors[index]?.has('voixWadagniTalata') ? 'input-error' : ''
                        }`}
                        placeholder="0"
                        value={bureau.voixWadagniTalata}
                        onChange={(e) => updateBureauVote(index, 'voixWadagniTalata', parseInt(e.target.value) || 0)}
                        onFocus={(e) => e.target.select()}
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                        min="0"
                        required
                      />
                      {validationErrors[index]?.has('voixWadagniTalata') && (
                        <label className="label">
                          <span className="label-text-alt text-error">
                            Erreur de validation sur le champ WADAGNI - TALATA
                          </span>
                        </label>
                      )}
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">HOUNKPE - HOUNWANOU *</span>
                      </label>
                      <input
                        type="number"
                        className={`input input-bordered ${
                          validationErrors[index]?.has('voixHounkpeHounwanou') ? 'input-error' : ''
                        }`}
                        placeholder="0"
                        value={bureau.voixHounkpeHounwanou}
                        onChange={(e) => updateBureauVote(index, 'voixHounkpeHounwanou', parseInt(e.target.value) || 0)}
                        onFocus={(e) => e.target.select()}
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                        min="0"
                        required
                      />
                      {validationErrors[index]?.has('voixHounkpeHounwanou') && (
                        <label className="label">
                          <span className="label-text-alt text-error">
                            Erreur de validation sur le champ HOUNKPE - HOUNWANOU
                          </span>
                        </label>
                      )}
                    </div>

                    <div className="form-control sm:col-span-2">
                      {!bureau.showObservations ? (
                        <button
                          type="button"
                          onClick={() => toggleObservations(index)}
                          className="btn btn-outline btn-sm w-full"
                        >
                          Ajouter une observation
                        </button>
                      ) : (
                        <>
                          <textarea
                            className="textarea textarea-bordered"
                            placeholder="Observations"
                            value={bureau.observations}
                            onChange={(e) => updateBureauVote(index, 'observations', e.target.value)}
                            rows={2}
                          />
                          <button
                            type="button"
                            onClick={() => toggleObservations(index)}
                            className="btn btn-ghost btn-sm mt-2"
                          >
                            Masquer
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="form-control mt-6">
            <div className="flex gap-4">
              <button
                type="button"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg 
                          transition-all duration-300 transform hover:scale-105 hover:shadow-lg 
                          active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg 
                          transition-all duration-300 transform hover:scale-105 hover:shadow-lg 
                          active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Envoi...' : 'Soumettre'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

