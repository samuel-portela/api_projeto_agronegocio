const DadosPlantacao = require('../models/DadosPlantacao');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

class DadosPlantacaoController{

    async create(req,res){
        let {nome, tipo_plantacao, token} = req.body;

        const decoded = jwt.verify(token, process.env.SECRET);
        const usuario_id = decoded.id;

        let result = await DadosPlantacao.create(nome, tipo_plantacao, usuario_id);

        result.status
        ? res.status(200).json({sucess: true, message:"Usuário Cadastrado com Sucesso"})
        : res.status(404).json({sucess: false, message: result.err})
    }

    async findById(req,res){
        if(isNaN(req.params.id) || !req.params.id){
            return res.status(404).json({
                message: 'Parametro ID obrigatório!'
            });
        }

        const decoded = jwt.verify(req.params.id, process.env.SECRET);
        const usuario_id = decoded.id;

        let dadosUsuario = await DadosPlantacao.findById(usuario_id);

        if (dadosUsuario.status == undefined){
            res.status(406).json({sucess: false, message:"Não encontrado"});
        }else if (!dadosUsuario.status){
            res.status(404).json({sucess: false, message: dadosUsuario.err})
        }else{
            res.status(200).json({sucess: true, message:dadosUsuario.values})
        }
        
    }

    async findByToken(req, res) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Token não informado' });
        }

        try {
            const decoded = jwt.verify(token, process.env.SECRET);
            const usuario_id = decoded.id;

            let dadosUsuario = await DadosPlantacao.findById(usuario_id);

            if (!dadosUsuario || dadosUsuario.status == undefined) {
            return res.status(406).json({ success: false, message: "Não encontrado" });
            }

            if (!dadosUsuario.status) {
            return res.status(404).json({ success: false, message: dadosUsuario.err });
            }

            return res.status(200).json({ success: true, message: dadosUsuario.values });
        } catch (err) {
            return res.status(401).json({ message: 'Token inválido' });
        }
    }

    async editUser(req, res){
        let id = req.params.id
        
        if(!id){
            return res.status(404).json({sucess: false, message:'Parametro Inválido'})
        }

        let {nome,user,senha} = req.body

        if(senha){
            senha = bcrypt.hashSync(senha,bcrypt.genSaltSync(10))
        }

        if(!id){
            return res.status(404).json({sucess: false, message:'Parametro Inválido'})
        }
            
        let result = await Usuarios.update(id, nome, user,senha)
        result.status 
        ? res.status(200).json({sucess: result.status, message: result.message})
        : res.status(406).json({sucess: result.status, message: result.err})
        
    }

}

module.exports = new DadosPlantacaoController();