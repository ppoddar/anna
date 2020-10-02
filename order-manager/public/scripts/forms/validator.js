
function validateUserName(username, cb) {
    if (!username) {
        cb.call(null, 'username is empty')
    } else {
        console.log(`=========> asking server to validate user [${username}]` )
    }
    $.ajax({
        url: '/validate/username',
        method: 'POST',
        data: JSON.stringify({username:username}),
        contentType: 'application/json'
    }).done(function(response) {
        if (!response.valid) {
            cb.call(null, response.reason)
        }
    })
}

async function validatePassword(pwd) {
    let url = "validate/password";
    let response   = await fetch(url, {method:'POST'})
    let validation = await response.json()
    if (validation.valid) {
        return null
    } else {
        return validation.message
    }
}

export {
    validateUserName,
    validatePassword
}