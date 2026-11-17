<?php

use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Route;

beforeEach(function (): void {
    Route::get('/_test/database-unavailable', function () {
        $exception = new PDOException('SQLSTATE[HY000] [2002] Connection refused', 2002);
        $exception->errorInfo = ['HY000', 2002, 'Connection refused'];

        throw new QueryException('mysql', 'select 1', [], $exception);
    });
});

it('shows a safe HTML page and JSON response when the database connection is unavailable', function (): void {
    $this->get('/_test/database-unavailable')
        ->assertStatus(503)
        ->assertSee('سرویس موقتاً در دسترس نیست')
        ->assertSee('تلاش دوباره')
        ->assertDontSee('SQLSTATE')
        ->assertDontSee('QueryException');

    $this->getJson('/_test/database-unavailable')
        ->assertStatus(503)
        ->assertJsonPath('code', 'database_unavailable')
        ->assertJsonPath('message', 'ارتباط با پایگاه داده موقتاً برقرار نیست. لطفاً کمی بعد دوباره تلاش کنید.');
});
