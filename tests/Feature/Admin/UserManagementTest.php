<?php

use App\Models\User;

test('non-admins cannot access the users page', function () {
    $user = User::factory()->create(['is_admin' => false]);

    $this->actingAs($user)
        ->get(route('admin.users.index'))
        ->assertForbidden();
});

test('guests cannot access the users page', function () {
    $this->get(route('admin.users.index'))
        ->assertRedirect(route('login'));
});

test('admins can view the users page', function () {
    $admin = User::factory()->create(['is_admin' => true]);

    $this->actingAs($admin)
        ->get(route('admin.users.index'))
        ->assertOk();
});

test('admins can create a user', function () {
    $admin = User::factory()->create(['is_admin' => true]);

    $response = $this->actingAs($admin)->post(route('admin.users.store'), [
        'name' => 'New User',
        'email' => 'new-user@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'is_admin' => false,
    ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.users.index'));

    $this->assertDatabaseHas('users', [
        'email' => 'new-user@example.com',
        'is_admin' => false,
    ]);
});

test('admins can update a user', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $user = User::factory()->create(['is_admin' => false]);

    $response = $this->actingAs($admin)->put(route('admin.users.update', $user), [
        'name' => 'Updated Name',
        'email' => $user->email,
        'is_admin' => true,
    ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.users.index'));

    $user->refresh();

    expect($user->name)->toBe('Updated Name');
    expect($user->is_admin)->toBeTrue();
});

test('admins can delete another user', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $user = User::factory()->create();

    $response = $this->actingAs($admin)->delete(route('admin.users.destroy', $user));

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.users.index'));

    $this->assertDatabaseMissing('users', ['id' => $user->id]);
});

test('admins cannot delete themselves', function () {
    $admin = User::factory()->create(['is_admin' => true]);

    $this->actingAs($admin)->delete(route('admin.users.destroy', $admin));

    $this->assertDatabaseHas('users', ['id' => $admin->id]);
});
