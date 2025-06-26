<script>
    export let message = 'Loading...';
</script>

<style>
    .container {
        display: block;
        width: 85%;
        max-width: 500px;
        margin: 80px auto;
        text-align: center;
    }

    .spinner {
        display: inline-block;
        position: relative;
        width: 64px;
        height: 16px;
    }

    .spinner div {
        position: absolute;
        top: 0;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--blueTwo);
        animation: spinner-bounce 0.8s infinite ease-in-out;
    }

    .spinner div:nth-child(1) {
        left: 0px;
        animation-delay: -0.32s;
    }
    .spinner div:nth-child(2) {
        left: 16px;
        animation-delay: -0.16s;
    }
    .spinner div:nth-child(3) {
        left: 32px;
    }

    @keyframes spinner-bounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
    }
</style>

<div class="container">
    <p>{message}</p>
    <div class="spinner">
        <div></div>
        <div></div>
        <div></div>
    </div>
</div>
