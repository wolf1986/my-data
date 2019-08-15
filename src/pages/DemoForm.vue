<template>
    <q-page padding>
        <dynamic-form :fields="fields"></dynamic-form>
    </q-page>
</template>

<script>
import DynamicForm from '../components/DynamicForm.vue';

export default {
    // name: 'PageName',
    components: {
        'dynamic-form': DynamicForm,
    },
    data: function() {
        return {
            fields: [
                {
                    id: 'name1',
                    type: 'q-input',
                    props: {
                        label: 'MyLabel',
                    },
                },
                {
                    id: 'name2',
                    type: 'q-input',
                },
            ],
        };
    },
};
</script>

<style>
</style>
