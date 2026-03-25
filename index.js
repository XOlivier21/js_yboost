const express = require('express');
const fs = require('fs');
const path = require('path');
let pokemons = require('./db-pokemons');
let helper = require('./helper');

const app = express();
const PORT = 3003;
const isVercel = process.env.VERCEL === '1';

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Page cartes Pokémon
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/pokemons', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API Pokemons
app.get('/api/pokemons', (req, res) => {
    const message = `List of ${pokemons.length} * pokemons`;
    res.json( helper.success(message, pokemons) );    
});

app.get('/api/pokemons/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const pokemon = pokemons.find( pokemon => pokemon.id === id );
    const message = "One pokemon is founded !";
    res.json( helper.success(message, pokemon) );
});

// Routes pour /pokemon (API base)
app.get('/pokemon', (req, res) => {
    const message = `List of ${pokemons.length} pokemons`;
    res.json( helper.success(message, pokemons) );    
});

app.get('/pokemon/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const pokemon = pokemons.find( pokemon => pokemon.id === id );
    const message = "One pokemon is founded !";
    res.json( helper.success(message, pokemon) );
});

// Route pour afficher le formulaire d'ajout
app.get('/add-pokemon', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html lang="FR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ajouter un Pokémon</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            .form-container {
                background: white;
                padding: 40px;
                border-radius: 15px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                max-width: 500px;
                width: 100%;
            }
            h1 {
                text-align: center;
                color: #333;
                margin-bottom: 30px;
            }
            .form-group {
                margin-bottom: 20px;
            }
            label {
                display: block;
                margin-bottom: 8px;
                color: #555;
                font-weight: bold;
            }
            input, select, textarea {
                width: 100%;
                padding: 12px;
                border: 2px solid #ddd;
                border-radius: 8px;
                font-size: 1em;
                box-sizing: border-box;
                transition: border-color 0.3s;
            }
            input:focus, select:focus, textarea:focus {
                outline: none;
                border-color: #667eea;
            }
            textarea {
                resize: vertical;
                min-height: 80px;
            }
            .button-group {
                display: flex;
                gap: 10px;
                margin-top: 30px;
            }
            button {
                flex: 1;
                padding: 12px;
                border: none;
                border-radius: 8px;
                font-size: 1em;
                font-weight: bold;
                cursor: pointer;
                transition: transform 0.2s;
            }
            .btn-submit {
                background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                color: white;
            }
            .btn-submit:hover {
                transform: scale(1.05);
            }
            .btn-cancel {
                background: #ddd;
                color: #333;
            }
            .btn-cancel:hover {
                background: #bbb;
            }
        </style>
    </head>
    <body>
        <div class="form-container">
            <h1>➕ Ajouter un Pokémon</h1>
            <form method="POST" action="/api/add-pokemon">
                <div class="form-group">
                    <label for="name">Nom du Pokémon *</label>
                    <input type="text" id="name" name="name" required>
                </div>
                <div class="form-group">
                    <label for="hp">HP (points de vie) *</label>
                    <input type="number" id="hp" name="hp" min="1" required>
                </div>
                <div class="form-group">
                    <label for="cp">CP (Attaque) *</label>
                    <input type="number" id="cp" name="cp" min="1" required>
                </div>
                <div class="form-group">
                    <label for="picture">URL de l'image *</label>
                    <input type="url" id="picture" name="picture" placeholder="https://..." required>
                </div>
                <div class="form-group">
                    <label for="types">Types (séparés par une virgule) *</label>
                    <input type="text" id="types" name="types" placeholder="Feu, Plante" required>
                </div>
                <div class="button-group">
                    <a href="/pokemons" class="btn-cancel" style="display: flex; align-items: center; justify-content: center; text-decoration: none;">Annuler</a>
                    <button type="submit" class="btn-submit">Ajouter</button>
                </div>
            </form>
        </div>
    </body>
    </html>
    `;
    res.send(html);
});

// Route POST pour ajouter un Pokémon
app.post('/api/add-pokemon', (req, res) => {
    const { name, hp, cp, picture, types } = req.body;

    // Validation
    if (!name || !hp || !cp || !picture || !types) {
        return res.status(400).send('Tous les champs sont obligatoires !');
    }

    // Créer le nouveau Pokémon
    const newId = Math.max(...pokemons.map(p => p.id)) + 1;
    const newPokemon = {
        id: newId,
        name: name,
        hp: parseInt(hp),
        cp: parseInt(cp),
        picture: picture,
        types: types.split(',').map(t => t.trim()),
        created: new Date()
    };

    // Ajouter à la liste en mémoire
    pokemons.push(newPokemon);

    // Sur Vercel, le filesystem est non persistant: on ne tente pas d'écrire sur disque.
    if (!isVercel) {
        const pokemonsContent = 'const pokemons = ' + JSON.stringify(pokemons, null, 2) + '\n\nmodule.exports = pokemons;';
        fs.writeFileSync(path.join(__dirname, 'db-pokemons.js'), pokemonsContent);
    }

    // Redirection vers la page des Pokémon
    res.redirect('/');
});

// Lancement du serveur
if (!isVercel) {
    app.listen(PORT, () => {
        console.log(`Server listening on http://localhost:${PORT}`);
    });
}

module.exports = app;