<template>
  <q-layout view="lHh Lpr lFf">
    <q-header
      :class="bgColor"
    >
      <q-toolbar>
        <q-btn
          flat
          round
          dense
          aria-label="Menu"
          class="q-ma-sm"
          icon="menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />
        <q-toolbar-title>
          <router-link :to="{name: 'inicio'}" class="title">
            Actuaría v3.0
          </router-link>
          <div class="text-subtitle2">
            <a href="#" class="title" @click.prevent="goSidj"> Sistema Digital de Juicios v4.0 </a>
          </div>
        </q-toolbar-title>
        <q-btn flat round dense icon="settings_power">
          <q-menu>
            <q-list style="min-width: 100px">
              <q-item clickable
                :to="{name: 'form-perfil'}"
              >
                <q-item-section>
                  Editar perfil
                </q-item-section>
              </q-item>
              <q-item clickable
                @click.prevent="logOut"
              >
                <q-item-section>
                  Salir
                </q-item-section>
                <q-item-section avatar>
                  <q-icon color="red" name="exit_to_app" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      content-class="bg-grey-3"
    >
      <q-list padding class="rounded-borders text-primary">
        <q-item-label header>
          <q-avatar rounded class="q-mx-lg">
            <img style="width: 50px; object-fit: contain;"
              alt="Tribunal de Justicia Administrativa"
              src="~assets/logo-tribunal-tabasco.png"
            >
          </q-avatar>
          <strong>Menú principal</strong>
        </q-item-label>

        <q-item
          v-ripple
          clickable
          class="menu"
          active-class="selected"
          :to="{name: 'expediente-busqueda'}"
          @click="link = 'expediente-busqueda'"
          :active="link === 'expediente-busqueda'"
        >
          <q-item-section avatar>
            <q-icon name="library_books" />
          </q-item-section>

          <q-item-section>
            Consulta de expediente v{{env.VERSION_CONSULTA_EXPEDIENTE}}
          </q-item-section>
        </q-item>

        <q-item
          v-ripple
          clickable
          class="menu"
          active-class="selected"
          :to="{name: 'notificaciones-busqueda'}"
          @click="link = 'notificaciones-busqueda'"
          :active="link === 'notificaciones-busqueda'"
        >
          <q-item-section avatar>
            <q-icon name="description" />
          </q-item-section>

          <q-item-section>
            Notificaciones v{{env.VERSION_NOTIFICACIONES}}
          </q-item-section>
        </q-item>

        <q-item
          v-ripple
          clickable
          class="menu"
          active-class="selected"
          :to="{name: 'generacion-listado'}"
          @click="link = 'generacion-listado'"
          :active="link === 'generacion-listado'"
        >
          <q-item-section avatar>
            <q-icon name="assignment_turned_in" />
          </q-item-section>

          <q-item-section>
            Lista de estrados v{{env.VERSION_ESTRADOS_BOLETIN}}
          </q-item-section>
        </q-item>

        <q-item v-show="false"
          v-ripple
          clickable
          class="menu"
          active-class="selected"
          :to="{name: 'generacion-notificaciones-comparecencia'}"
          @click="link = 'generacion-notificaciones-comparecencia'"
          :active="link === 'generacion-notificaciones-comparecencia'"
        >
          <q-item-section avatar>
            <q-icon name="reorder" />
          </q-item-section>

          <q-item-section>
            Notificaciones comparecencia v{{env.VERSION_NOTIFICACIONES_COMPARECENCIA}}
          </q-item-section>
        </q-item>

        <!-- <q-item v-if="isAllowed(['admin', 'coordinador.actuarios.ss'])"
          v-ripple
          clickable
          class="menu"
          active-class="selected"
          :to="{name: 'busqueda-citas-sco'}"
          @click="link = 'busqueda-citas-sco'"
          :active="link === 'busqueda-citas-sco'"
        >
          <q-item-section avatar>
            <q-icon name="input" />
          </q-item-section>

          <q-item-section>
            Citas SCO v{{env.VERSION_CITAS_SCO}}
          </q-item-section>
        </q-item> -->

        <q-item v-if="isAllowed(['admin', 'actuaria'])"
          v-ripple
          clickable
          class="menu"
          active-class="selected"
          :to="{name: 'generacion-cedula'}"
          @click="link = 'generacion-cedula'"
          :active="link === 'generacion-cedula'"
        >
          <q-item-section avatar>
            <q-icon name="receipt" />
          </q-item-section>

          <q-item-section>
            Generación de cédulas v{{env.VERSION_GENERACION_CEDULAS}}
          </q-item-section>
        </q-item>

        <q-expansion-item
          v-if="isAllowed(['admin', 'actuaria'])"
          class="menu"
          default-opened
          icon="build_circle"
          label="Administración"
        >
          <q-item v-if="isAllowed(['admin', 'actuaria'])"
            v-ripple
            clickable
            class="menu q-ml-md"
            active-class="selected"
            :to="{name: 'grupo-plantillas-busqueda'}"
            @click="link = 'grupo-plantillas-busqueda'"
            :active="link === 'grupo-plantillas-busqueda'"
          >
            <q-item-section avatar>
              <q-icon name="folder_shared" />
            </q-item-section>

            <q-item-section>
              Plantillas v{{env.VERSION_ADMIN_PLANTILLAS}}
            </q-item-section>
          </q-item>

          <q-item v-if="isAllowed(['admin'])"
            clickable
            v-ripple
            class="menu q-ml-md"
            active-class="selected"
            :to="{name: 'admin-tipos-leyendas'}"
            @click="link = 'admin-tipos-leyendas'"
            :active="link === 'admin-tipos-leyendas'"
          >
            <q-item-section avatar>
              <q-icon name="toc" />
            </q-item-section>

            <q-item-section>
              Leyendas para estrados v{{env.VERSION_ADMIN_LEYENDAS}}
            </q-item-section>
          </q-item>
        </q-expansion-item>

        <q-item
          v-ripple
          clickable
          class="menu"
          active-class="selected"
          :to="{name: 'ayuda'}"
          @click="link = 'ayuda'"
          :active="link === 'ayuda'"
        >
          <q-item-section avatar>
            <q-icon name="help"/>
          </q-item-section>

          <q-item-section>Ayuda</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view
        :key="$route.fullPath"
        @leftDrawerOpen="leftDrawer"
      ></router-view>
    </q-page-container>
  </q-layout>
</template>

<script>
import {
  QMenu,
  QList,
  QIcon,
  QAvatar,
  QItemLabel,
  QItemSection,
  QExpansionItem,
} from 'quasar';

import env from 'boot/env';

export default {
  name: 'BaseLayout',
  data() {
    return {
      link: 'inicio',
      leftDrawerOpen: this.$q.platform.is.desktop,
    };
  },
  components: {
    QMenu,
    QList,
    QIcon,
    QAvatar,
    QItemLabel,
    QItemSection,
    QExpansionItem,
  },
  computed: {
    env() {
      return env;
    },
    session() {
      return this.$store.getters['session/getUsuario'];
    },
    permisos() {
      return this.$store.getters['session/getPermisos'].roles.name;
    },
    bgColor() {
      return this.$store.getters['layoutsLabels/getBgHeaderLayoutColor'];
    },
  },
  methods: {
    isAllowed(roles) {
      return roles.some(i => this.permisos.some(j => i === j));
    },
    logOut() {
      this.$store.dispatch('session/logOut').then(() => {
        window.location.replace(`${window.location.protocol}//${window.location.host}/login`);
      });
    },
    leftDrawer(val) {
      this.leftDrawerOpen = val;
    },
    goSidj() {
      window.location.replace(`${window.location.protocol}//${window.location.host}/`);
    },
  },
};
</script>

<style>
.title{
  color: white;
  text-decoration: none;
}
.selected{
  color: white !important;
  background: #994567 !important;
}
.menu{
  color: #696464;
}
</style>
