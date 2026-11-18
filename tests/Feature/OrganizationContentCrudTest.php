<?php

use App\Models\Department;
use Database\Seeders\DatabaseSeeder;

beforeEach(fn () => $this->seed(DatabaseSeeder::class));

it('manages organization units and members with a validated ordered hierarchy', function (): void {
    $token = $this->postJson('/api/v1/auth/login', loginPayloadWithCaptcha($this))
        ->assertOk()->json('token');
    $root = Department::query()->whereNull('parent_id')->firstOrFail();

    $parent = $this->withToken($token)->postJson('/api/v1/admin/departments', [
        'parent_id' => $root->id,
        'name_fa' => 'واحد آزمایشی',
        'name_en' => 'Test Unit',
        'head_name_fa' => 'مدیر آزمایشی',
        'head_name_en' => 'Test Manager',
        'head_title_fa' => 'مدیر',
        'head_title_en' => 'Manager',
        'color' => '#123456',
        'member_count' => 1,
        'sort_order' => 20,
    ])->assertCreated()->json('data');

    $child = $this->withToken($token)->postJson('/api/v1/admin/departments', [
        'parent_id' => $parent['id'],
        'name_fa' => 'زیرواحد آزمایشی',
        'name_en' => 'Test Subunit',
        'head_name_fa' => 'مسئول آزمایشی',
        'head_name_en' => 'Test Lead',
        'head_title_fa' => 'مسئول',
        'head_title_en' => 'Lead',
        'sort_order' => 30,
    ])->assertCreated()->json('data');

    $this->withToken($token)->putJson("/api/v1/admin/departments/{$parent['id']}", [
        'parent_id' => $child['id'],
    ])->assertUnprocessable()->assertJsonValidationErrors('parent_id');

    $firstMember = $this->withToken($token)->postJson('/api/v1/admin/team', [
        'department_id' => $child['id'],
        'name_fa' => 'کارمند اول',
        'name_en' => 'First Employee',
        'role_fa' => 'کارشناس',
        'role_en' => 'Specialist',
        'sort_order' => 10,
    ])->assertCreated()->json('data');

    $secondMember = $this->withToken($token)->postJson('/api/v1/admin/team', [
        'department_id' => $child['id'],
        'name_fa' => 'کارمند دوم',
        'name_en' => 'Second Employee',
        'role_fa' => 'مهندس',
        'role_en' => 'Engineer',
        'sort_order' => 20,
    ])->assertCreated()->json('data');

    $this->withToken($token)->putJson("/api/v1/admin/team/{$firstMember['id']}", [
        'role_fa' => 'کارشناس ارشد',
    ])->assertOk()->assertJsonPath('data.role_fa', 'کارشناس ارشد');

    $publicDepartments = $this->getJson('/api/v1/departments')
        ->assertOk()->json('data.departments');
    $departmentIds = collect($publicDepartments)->pluck('id')->all();
    expect(array_search($parent['id'], $departmentIds, true))
        ->toBeLessThan(array_search($child['id'], $departmentIds, true));

    $publicTeam = $this->getJson('/api/v1/departments')
        ->assertOk()->json('data.team');
    $memberIds = collect($publicTeam)->pluck('id')->all();
    expect(array_search($firstMember['id'], $memberIds, true))
        ->toBeLessThan(array_search($secondMember['id'], $memberIds, true));
});
