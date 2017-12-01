<template>
    <div class="NotAllowed">
        <md-empty-state class="md-accent"
            md-rounded
            md-icon="error"
            md-label="403 Not Authorized"
            md-description="No tienes permiso para ver este contenido">
            <md-button class="md-primary md-raised"
                v-on:click="$router.replace('/')">Volver al inicio</md-button>
        </md-empty-state>
    </div>
</template>

<script>
export default {
    name: 'NotAllowed',
    metaInfo: {
        title: '403 Not Authorized'
    },
}
</script>
<style scoped>
.NotAllowed {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

