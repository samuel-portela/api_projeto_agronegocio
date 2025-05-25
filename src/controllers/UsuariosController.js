const Usuarios = require('../models/Usuarios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');
const crypto = require('crypto');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

let tokensTemporarios = [];

class UsuariosController{

    async login(req,res)
    {
      let {email, senha} = req.body
      let user = await Usuarios.findByEmail(email)
      if (!user.status){
          user.err === undefined
          ? res.status(406).json({sucess: user.status, message: 'E-mail não encontrado'})
          : res.status(404).json({sucess: user.status, message: user.err})
      }else{

          let isPassword = bcrypt.compareSync(senha, user.values.senha)


          if (isPassword){

            let token = jwt.sign({id: user.values.id, email: user.values.email, senha: user.values.senha, telefone: user.values.telefone},process.env.SECRET,{expiresIn: 600})
            res.status(200).json({sucess: isPassword, token: token})

          }else{
              res.status(406).json({sucess: isPassword, message: 'Senha Inválida'})
          }
      }
    }

    async recuperarSenha(req, res) {
        const { email, telefone } = req.body;

        telefone = telefone.replace(/\D/g, '');

        if (!telefone.startsWith('+')) {
          telefone = '+' + telefone;
        }
    
        try {
          const user = await Usuarios.findByEmail(email);
    
          if (!user.status) {
            return res.status(404).json({
              success: false,
              message: user.err || 'E-mail não encontrado'
            });
          }
    
          if (user.values.telefone !== telefone) {
            return res.status(400).json({
              success: false,
              message: 'Telefone não confere com o cadastrado'
            });
          }
    
          // Gerar token de 6 dígitos
          const token = crypto.randomInt(100000, 999999).toString();
    
          // Enviar SMS com Twilio
          await client.messages.create({
            body: `Seu código de recuperação é: ${token}`,
            from: twilioPhoneNumber,
            to: telefone // Ex: '+5511999999999'
          });
    
          // Armazenar token temporário (ideal: banco de dados)
          tokensTemporarios.push({
            email,
            token,
            expiresAt: Date.now() + 10 * 60 * 1000 // expira em 10 minutos
          });
    
          return res.status(200).json({
            success: true,
            message: 'Token enviado por SMS'
          });
    
        } catch (err) {
          console.error(err);
          return res.status(500).json({
            success: false,
            message: 'Erro ao enviar token por SMS'
          });
        }
      }

    async resetarSenha(req, res) {
        const { email, token, novaSenha } = req.body;
    
        try {
          // Verifica se existe um token válido
          const tokenInfo = tokensTemporarios.find(
            (item) => item.email === email && item.token === token
          );
    
          if (!tokenInfo) {
            return res.status(400).json({
              success: false,
              message: 'Token inválido ou expirado.'
            });
          }
    
          if (Date.now() > tokenInfo.expiresAt) {
            // Token expirou
            tokensTemporarios = tokensTemporarios.filter((t) => t !== tokenInfo);
            return res.status(400).json({
              success: false,
              message: 'Token expirado. Solicite um novo.'
            });
          }
    
          // Criptografa a nova senha
          const hashedPassword = await bcrypt.hash(novaSenha, 10);
    
          // Atualiza no banco de dados
          const updated = await Usuarios.updatePassword(email, hashedPassword);
    
          if (!updated.success) {
            return res.status(500).json({
              success: false,
              message: 'Erro ao atualizar senha.'
            });
          }
    
          // Remove o token usado
          tokensTemporarios = tokensTemporarios.filter((t) => t !== tokenInfo);
    
          return res.status(200).json({
            success: true,
            message: 'Senha redefinida com sucesso.'
          });
    
        } catch (err) {
          console.error(err);
          return res.status(500).json({
            success: false,
            message: 'Erro interno.'
          });
        }
      }

    // async recuperarSenha(req, res) {
    //     const { email, telefone } = req.body;
    
    //     try {
    //       const user = await Usuarios.findByEmail(email);
    
    //       if (!user.status) {
    //         return res.status(404).json({
    //           success: false,
    //           message: user.err || 'E-mail não encontrado'
    //         });
    //       }
    
    //       if (user.values.telefone !== telefone) {
    //         return res.status(400).json({
    //           success: false,
    //           message: 'Telefone não confere com o cadastrado'
    //         });
    //       }

    //       const token = crypto.randomInt(100000, 999999).toString();

    //       salvarToken = await Usuarios.salvarToken(email, token)

    //       console.log(`SMS para ${telefone}: Seu código de recuperação é ${token}`);
    
    //       tokensTemporarios.push({
    //         email,
    //         token,
    //         expiresAt: Date.now() + 10 * 60 * 1000
    //       });
    
    //       return res.status(200).json({
    //         success: true,
    //         message: 'Token enviado por SMS'
    //       });
    //     } catch (err) {
    //       console.error(err);
    //       return res.status(500).json({
    //         success: false,
    //         message: 'Erro interno ao processar requisição'
    //       });
    //     }
    //   }

      async resetarSenha(req, res) {
        const { email, token, novaSenha } = req.body;
    
        try {
          const tokenInfo = await Usuarios.findByToken(token);

          if (!tokenInfo) {
            return res.status(400).json({
              success: false,
              message: 'Token inválido ou expirado.'
            });
          }
    
          if (Date.now() > tokenInfo.expiresAt) {
            tokensTemporarios = tokensTemporarios.filter((t) => t !== tokenInfo);
            return res.status(400).json({
              success: false,
              message: 'Token expirado. Solicite um novo.'
            });
          }
    
          // Criptografa a nova senha
          const hashedPassword = await bcrypt.hash(novaSenha, 10);
    
          // Atualiza no banco de dados
          const updated = await Usuarios.updateSenha(email, hashedPassword);

        //   console.log(updated);
    
        //   if (!updated.success) {
        //     return res.status(500).json({
        //       success: false,
        //       message: 'Erro ao atualizar senha.'
        //     });
        //   }
    
          // Remove o token usado
          tokensTemporarios = tokensTemporarios.filter((t) => t !== tokenInfo);
    
          return res.status(200).json({
            success: true,
            message: 'Senha redefinida com sucesso.'
          });
    
        } catch (err) {
          console.error(err);
          return res.status(500).json({
            success: false,
            message: 'Erro interno.'
          });
        }
      }

    async create(req,res){
        let {nome, email, telefone, senha} = req.body;
        let salt = bcrypt.genSaltSync(10);
        telefone = telefone.replace(/\D/g, '');

        if (!telefone.startsWith('+')) {
          telefone = '+' + telefone;
        }

        let result = await Usuarios.create(nome, email, telefone , bcrypt.hashSync(senha,salt));

        result.status
        ? res.status(200).json({sucess: true, message:"Usuário Cadastrado com Sucesso"})
        : res.status(404).json({sucess: false, message: result.err})
    }

    async findAll(req,res){
        let dadosUsuario = await Usuarios.findAll();

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

        let dadosUsuario = await Usuarios.findById(req.params.id);

        if (dadosUsuario.status == undefined){
            res.status(406).json({sucess: false, message:"Usuário não encontrado"});
        }else if (!dadosUsuario.status){
            res.status(404).json({sucess: false, message: dadosUsuario.err})
        }else{
            res.status(200).json({sucess: true, message:dadosUsuario.values})
        }
        
    }

    async remove(req, res){
        if(isNaN(req.params.id)){
            return res.status(404).json({sucess: false, message:'Parametro Inválido'})
        }

        let result = await Usuarios.delete(req.params.id)
        result.status 
        ? res.status(200).json({sucess: result.status, message: result.message})
        : res.status(406).json({sucess: result.status, message: result.err})
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

module.exports = new UsuariosController();