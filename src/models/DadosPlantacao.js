const knex = require('../data/connection');

class DadosPlantacao{

    async create(nome, tipo_plantacao, usuario_id){
        try {
            await knex.insert({
                nome: nome,
                tipo_plantacao: tipo_plantacao,
                usuario_id: usuario_id
            }).table('dados_plantacao');

            return {status: true }
        } catch (err) {
            return {status: false, err: err}  
        }
    }

    async findById(id){
        try {
            let user = await knex.select(['nome','tipo_plantacao','usuario_id']).where({usuario_id: id}).table('dados_plantacao');
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

module.exports = new DadosPlantacao();