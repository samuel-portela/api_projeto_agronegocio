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

    async findAll(req,res){
        let dadosUsuario = await DadosPlantacao.findAll();

        dadosUsuario.status
        ? res.status(200).json({sucess: true, values: dadosUsuario.values})
        : res.status(404).json({sucess: false, message: dadosUsuario.err})
    }

    async findById(req,res){
        if(isNaN(req.params.id) || !req.params.id){
            return res.status(404).json({
                message: 'Parametro ID obrigatório!'
            });
        }

        let dadosUsuario = await DadosPlantacao.findById(req.params.id);

        if (dadosUsuario.status == undefined){
            res.status(406).json({sucess: false, message:"Não encontrado"});
        }else if (!dadosUsuario.status){
            res.status(404).json({sucess: false, message: dadosUsuario.err})
        }else{
            res.status(200).json({sucess: true, message:dadosUsuario.values})
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