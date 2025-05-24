const express = require('express');
const router = express.Router();
const UsuariosController = require('../controllers/UsuariosController');
const Auth = require('../middleware/AdminAuth');
const DadosPlantacaoController = require('../controllers/DadosPlantacaoController');

// Usuarios
router.post('/create',UsuariosController.create);
router.post('/recuperar-senha', UsuariosController.recuperarSenha);
router.post('/enviar-nova-senha', UsuariosController.resetarSenha);
router.get('/find-all',Auth,UsuariosController.findAll);
router.get('/find-usuarios/:id',Auth,UsuariosController.findById);
router.delete('/user/:id',Auth,UsuariosController.remove);
router.put('/user/:id',Auth, UsuariosController.editUser);
router.post('/login', UsuariosController.login);

router.post('/preencher-dados',DadosPlantacaoController.create);

module.exports = router;