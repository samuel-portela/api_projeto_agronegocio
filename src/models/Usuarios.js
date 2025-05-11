const knex = require('../data/connection');

class Usuarios{

    async create(nome, email, telefone, senha){
        try {
            await knex.insert({
                nome: nome,
                email: email,
                telefone: telefone,
                senha: senha
            }).table('usuarios');

            return {status: true }
        } catch (err) {
            return {status: false, err: err}  
        }
    }

    async salvarToken(email, token){
        let usuario = await this.findByEmail(email)

        if(usuario.status){
            try {
                await knex.update({token_recuperacao: token}).where({id:usuario.id}).table('usuarios')
                return ({status: true, message:'Usuário editado com sucesso!'})
            } catch (err) {
                return ({status: false, err: err})
            }
        }else{
            return {status: false, err: 'Usuário não existe, portanto não pode ser editado.'}
        }    
    }

    async findAll(){
        try {
            let users = await knex.select(['nome','user','senha','cpf']).table('usuarios');
            return {status: true, values: users}
        } catch (err) {
            console.log(err)
            return { status: false, err: err }
        }
    }

    async findById(id){
        try {
            let user = await knex.select(['nome','user','senha','cpf']).where({id: id}).table('usuarios');
            return user.length > 0 ? {status: true, values: user } : {status: undefined, message: 'Usuário Não existe!'}
        } catch (err) {
            return {status: false, err: err}
        }
    }

    async delete(id){
        let user = await this.findById(id)

        if (user.status){
            try {
                await knex.delete().where({id:id}).table('usuarios')
                return {status: true, message:'Usuário Excluido com Sucesso'}
            } catch (err) {
                return {status: false, err: err}
            }
        }else{
            return {status: false, err: 'Usuário não existe, portanto não pode ser deletado.'}
        }
    }

    async updateSenha(email, senhaNova){
        let usuario = await this.findByEmail(email)

        if(usuario.status){
            try {
                await knex.update({senha: senhaNova}).where({id:usuario.values.id}).table('usuarios')
                return ({status: true, message:'Usuário editado com sucesso!'})
            } catch (err) {
                return ({status: false, err: err})
            }
        }else{
            return {status: false, err: 'Usuário não existe, portanto não pode ser editado.'}
        }    
    }

    async findByEmail(email){
        try {
            let user = await knex.select(['id','nome','email','telefone','senha']).where({email:email}).table('usuarios')
            return user.length > 0 ? {status: true, values: user[0]} : {status: false, err: undefined} 
            
        } catch (err) {
            return {status: false, err: err}
        }
    }

    async findByToken(token){
        try {
            let user = await knex.select(['id','nome','email','telefone','senha']).where({token_recuperacao:token}).table('usuarios')
            return user.length > 0 ? {status: true, values: user[0]} : {status: false, err: undefined} 
            
        } catch (err) {
            return {status: false, err: err}
        }
    }



}

module.exports = new Usuarios();